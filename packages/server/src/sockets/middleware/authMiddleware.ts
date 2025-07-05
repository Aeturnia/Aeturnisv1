import { Socket } from 'socket.io';
import { AuthService } from '../../services/AuthService';
import { SocketWithAuth, SocketErrorResponse } from '../../types/socket.types';
import { logger } from '../../utils/logger';

export interface AuthMiddlewareOptions {
  authService: AuthService;
  tokenExtractor?: (socket: Socket) => string | undefined;
}

export class SocketAuthMiddleware {
  private authService: AuthService;
  private tokenExtractor: (socket: Socket) => string | undefined;

  constructor(options: AuthMiddlewareOptions) {
    this.authService = options.authService;
    this.tokenExtractor = options.tokenExtractor || this.defaultTokenExtractor;
  }

  // Default token extraction from handshake auth or query params
  private defaultTokenExtractor(socket: Socket): string | undefined {
    // Try auth object first
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }

    // Try query params
    if (socket.handshake.query?.token) {
      return Array.isArray(socket.handshake.query.token)
        ? socket.handshake.query.token[0]
        : socket.handshake.query.token;
    }

    // Try headers
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return undefined;
  }

  // Create middleware function
  public createMiddleware() {
    return async (socket: SocketWithAuth, next: (err?: Error) => void) => {
      try {
        const token = this.tokenExtractor(socket);

        if (!token) {
          const error = this.createAuthError('NO_TOKEN', 'No authentication token provided');
          logger.warn('Socket connection rejected - No token provided', {
            socketId: socket.id,
            ip: socket.handshake.address,
            userAgent: socket.handshake.headers['user-agent'],
          });
          return next(error);
        }

        // Verify token using existing auth service
        const payload = await this.authService.verifyToken(token);

        if (!payload || payload.type !== 'access') {
          const error = this.createAuthError('INVALID_TOKEN', 'Invalid or expired token');
          logger.warn('Socket connection rejected - Invalid token', {
            socketId: socket.id,
            ip: socket.handshake.address,
            tokenPayload: payload,
          });
          return next(error);
        }

        // Attach user context to socket
        socket.user = {
          userId: payload.userId,
          email: payload.email,
          username: payload.email.split('@')[0], // Default username from email
          roles: payload.roles,
        };

        // Log successful authentication
        logger.info('Socket authenticated successfully', {
          socketId: socket.id,
          userId: payload.userId,
          email: payload.email,
          ip: socket.handshake.address,
        });

        next();
      } catch (error) {
        const authError = this.createAuthError(
          'AUTH_ERROR',
          'Authentication failed',
          error instanceof Error ? error.message : 'Unknown error'
        );

        logger.error('Socket authentication error', {
          socketId: socket.id,
          ip: socket.handshake.address,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });

        next(authError);
      }
    };
  }

  private createAuthError(code: string, message: string, details?: string): Error {
    const error = new Error(message);
    (error as unknown as { data: unknown }).data = {
      error: {
        code,
        message,
        details,
      },
      timestamp: Date.now(),
    } as SocketErrorResponse;
    return error;
  }

  // Middleware for token refresh during connection
  public async refreshTokenMiddleware(socket: SocketWithAuth, token: string): Promise<boolean> {
    try {
      const payload = await this.authService.verifyToken(token);

      if (!payload || payload.type !== 'access') {
        return false;
      }

      // Update user context
      socket.user = {
        userId: payload.userId,
        email: payload.email,
        username: payload.email.split('@')[0], // Default username from email
        roles: payload.roles,
      };

      logger.info('Socket token refreshed successfully', {
        socketId: socket.id,
        userId: payload.userId,
      });

      return true;
    } catch (error) {
      logger.error('Socket token refresh failed', {
        socketId: socket.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  // Validate user permissions for specific actions
  public validatePermissions(socket: SocketWithAuth, requiredRoles: string[]): boolean {
    if (!socket.user) {
      return false;
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some(role => socket.user!.roles.includes(role));
  }

  // Extract character ID from user session or database lookup
  public async attachCharacterContext(socket: SocketWithAuth, characterId?: string): Promise<void> {
    if (!socket.user) {
      return;
    }

    // If character ID is provided, validate it belongs to the user
    if (characterId) {
      // TODO: Implement character ownership validation
      // For now, just attach the character ID
      socket.user.characterId = characterId;
    }

    logger.info('Character context attached to socket', {
      socketId: socket.id,
      userId: socket.user.userId,
      characterId: socket.user.characterId,
    });
  }
}

// Factory function to create auth middleware
export function createSocketAuthMiddleware(authService: AuthService) {
  const middleware = new SocketAuthMiddleware({ authService });
  return middleware.createMiddleware();
}

// Helper function to check if socket is authenticated
export function isAuthenticated(socket: SocketWithAuth): socket is SocketWithAuth & { user: NonNullable<SocketWithAuth['user']> } {
  return socket.user !== undefined;
}

// Helper function to check if socket has specific role
export function hasRole(socket: SocketWithAuth, role: string): boolean {
  return socket.user?.roles.includes(role) ?? false;
}

// Helper function to check if socket has any of the specified roles
export function hasAnyRole(socket: SocketWithAuth, roles: string[]): boolean {
  return roles.some(role => socket.user?.roles.includes(role)) ?? false;
}