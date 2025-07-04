import rateLimit from 'express-rate-limit';
// import { RedisStore } from 'rate-limit-redis'; // Disabled with Redis
// import { redis } from '../cache/redis'; // Disabled with Redis

export const rateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}) => {
  return rateLimit({
    // Using memory store instead of Redis for now
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redis.sendCommand(args),
    // }),
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: options.message,
    },
    standardHeaders: options.standardHeaders ?? true,
    legacyHeaders: options.legacyHeaders ?? false,
  });
};