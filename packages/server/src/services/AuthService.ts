import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { db } from '../database/config';
import { users } from '../database/schema';
import { eq, or } from 'drizzle-orm';
// import { redis } from '../cache/redis'; // Disabled until Redis is available
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
  passwordHash?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  // private readonly REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // Disabled with Redis
  
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
    const existingUser = await db.select({
      id: users.id
    }).from(users).where(
      or(
        eq(users.email, email.toLowerCase()),
        eq(users.username, username.toLowerCase())
      )
    );

    if (existingUser.length > 0) {
      throw new ConflictError('Email or username already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password, this.argon2Options);

    // Create user
    const [user] = await db.insert(users).values({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
    }).returning({
      id: users.id,
      email: users.email,
      username: users.username,
      roles: users.roles,
      createdAt: users.createdAt,
    });

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
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      passwordHash: users.passwordHash,
      roles: users.roles,
    }).from(users).where(
      or(
        eq(users.email, emailOrUsername.toLowerCase()),
        eq(users.username, emailOrUsername.toLowerCase())
      )
    );

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Update last login
    await db.update(users).set({
      lastLogin: new Date(),
    }).where(eq(users.id, user.id));

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

      // Redis disabled - skip session validation for now
      // TODO: Re-enable Redis session validation when Redis is available
      // const storedToken = await redis.get(`session:${payload.jti}`);
      // if (!storedToken || storedToken !== refreshToken) {
      //   await this.invalidateUserSessions(payload.userId);
      //   throw new UnauthorizedError('Token reuse detected');
      // }

      // Get fresh user data
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        username: users.username,
        roles: users.roles,
      }).from(users).where(eq(users.id, payload.userId));

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Redis disabled - skip token deletion for now
      // await redis.del(`session:${payload.jti}`);

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

    // Redis disabled - skip token storage for now
    // await redis.setEx(
    //   `session:${jti}`,
    //   this.REFRESH_TOKEN_EXPIRY_SECONDS,
    //   refreshToken
    // );

    return { accessToken, refreshToken };
  }

  // Disabled with Redis
  // private async invalidateUserSessions(userId: string) {
  //   // In production, maintain a user->sessions mapping
  //   // For now, log the security event
  //   console.error(`🚨 Security: Token reuse detected for user ${userId}`);
  // }

  async logout(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as AuthPayload;
      
      if (payload.jti) {
        // Redis disabled - skip token deletion for now
        // await redis.del(`session:${payload.jti}`);
      }
    } catch {
      // Silent fail - token might already be invalid
    }
  }
}