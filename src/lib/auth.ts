import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'thewebvale-sovereign-production-jwt-secret-key-32b';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
}

/**
 * Hashes a plain-text password using bcrypt.
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Verifies a plain-text password against a bcrypt hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

/**
 * Generates a cryptographically-secure 32-byte hex token.
 */
export function generateCryptoToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates a 6-digit numeric backup security code.
 */
export function generateNumericCode(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Issues a signed JWT session token valid for 7 days.
 */
export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a signed JWT session token.
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts and verifies session identity from request headers or cookie.
 */
export function getAuthSessionFromRequest(req: NextRequest): TokenPayload | null {
  // 1. Check HTTP-only cookie
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) {
    const verified = verifySessionToken(cookieToken);
    if (verified) return verified;
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearerToken = authHeader.substring(7);
    return verifySessionToken(bearerToken);
  }

  return null;
}
