import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { errors } from './errors.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export interface JwtPayload {
  userId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || typeof decoded.userId !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { userId: decoded.userId };
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(errors.unauthorized('Missing or invalid Authorization header'));
    return;
  }
  const token = header.slice('Bearer '.length);
  try {
    const { userId } = verifyToken(token);
    req.userId = userId;
    next();
  } catch {
    next(errors.unauthorized('Invalid token'));
  }
}
