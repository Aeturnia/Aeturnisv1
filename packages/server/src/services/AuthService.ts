import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { db } from '../database';
import { redis } from '../cache/redis';
import Joi from 'joi';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors';

interface AuthPayload {
  userId: string;
  email: string;
  roles: string[];
  type: 'access' | 'refresh';
  jti?: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  emailOrUsername: string;
  password: string;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  roles: string[];
  password_hash?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;
  
  private readonly argon2Options: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };

  // Validation schemas
  private readonly registerSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(20).required(),
    password: Joi.string().min(8).max(100)
      .pattern(/[A-Z]/, 'uppercase')
      .pattern(/[a-z]/, 'lowercase')
      .pattern(/[0-9]/, 'number')
      .pattern(/[!@#$%^&*]/, 'special')
      .required()
      .messages({
        'string.pattern.name': 'Password must contain at least one {#name} character',
      }),
  });

  private readonly loginSchema = Joi.object({
    emailOrUsername: Joi.string().required(),
    password: Joi.string().required(),
  });

  async register(data: RegisterData) {
    // Validate input
    const { error } = this.registerSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, username, password } = data;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('Email or username already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password, this.argon2Options);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, roles, created_at`,
      [email.toLowerCase(), username.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];

    // Generate tokens
    const tokens = await this.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async login(data: LoginData) {
    // Validate input
    const { error } = this.loginSchema.validate(data);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { emailOrUsername, password } = data;

    // Find user
    const result = await db.query(
      `SELECT id, email, username, password_hash, roles
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await argon2.verify(user.password_hash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const tokens = await this.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as AuthPayload;
      
      if (payload.type !== 'refresh' || !payload.jti) {
        throw new UnauthorizedError('Invalid token type');
      }

      // Check if token exists in Redis
      const storedToken = await redis.get(`session:${payload.jti}`);
      if (!storedToken || storedToken !== refreshToken) {
        // Token reuse detected - invalidate all user sessions
        await this.invalidateUserSessions(payload.userId);
        throw new UnauthorizedError('Token reuse detected');
      }

      // Get fresh user data
      const result = await db.query(
        'SELECT id, email, username, roles FROM users WHERE id = $1',
        [payload.userId]
      );

      if (result.rows.length === 0) {
        throw new UnauthorizedError('User not found');
      }

      const user = result.rows[0];

      // Delete old refresh token
      await redis.del(`session:${payload.jti}`);

      // Generate new token pair
      const tokens = await this.generateTokenPair(user);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  generateAccessToken(user: UserData): string {
    const payload: AuthPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      type: 'access',
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });
  }

  async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as AuthPayload;
      
      if (payload.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid access token');
      }
      throw error;
    }
  }

  private async generateTokenPair(user: UserData) {
    const jti = randomUUID();

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    // Generate refresh token
    const refreshPayload: AuthPayload = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      type: 'refresh',
      jti,
    };

    const refreshToken = jwt.sign(refreshPayload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Store refresh token in Redis
    await redis.setEx(
      `session:${jti}`,
      this.REFRESH_TOKEN_EXPIRY_SECONDS,
      refreshToken
    );

    return { accessToken, refreshToken };
  }

  private async invalidateUserSessions(userId: string) {
    // In production, maintain a user->sessions mapping
    // For now, log the security event
    console.error(`🚨 Security: Token reuse detected for user ${userId}`);
  }

  async logout(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as AuthPayload;
      
      if (payload.jti) {
        await redis.del(`session:${payload.jti}`);
      }
    } catch {
      // Silent fail - token might already be invalid
    }
  }
}