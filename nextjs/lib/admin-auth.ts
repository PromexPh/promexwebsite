// Server-only admin authentication. Never import this from a client component.
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'promex_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours, in seconds

function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

// Hash both sides first so the comparison is constant-time regardless of length
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && sessionSecret() !== null;
}

export function checkAdminPassword(password: unknown): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || typeof password !== 'string') return false;
  return safeEqual(password, adminPassword);
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

// Token format: "<expiry unix seconds>.<HMAC of expiry>"
export function createAdminSessionToken(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  const expires = String(Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (!safeEqual(signature, sign(expires, secret))) return false;
  return Number(expires) > Math.floor(Date.now() / 1000);
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/',
};

// For route handlers
export function isAdminRequest(req: NextRequest): boolean {
  return verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
}

// For server components
export function isAdminSession(): boolean {
  return verifyAdminSessionToken(cookies().get(ADMIN_COOKIE)?.value);
}
