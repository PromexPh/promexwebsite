import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  adminCookieOptions,
  checkAdminPassword,
  createAdminSessionToken,
  isAdminConfigured,
} from '@/lib/admin-auth';

// Log in: check the password and set a signed session cookie
export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin login not configured' }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  if (!checkAdminPassword(body?.password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
    ...adminCookieOptions,
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return res;
}

// Log out: clear the session cookie
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
  return res;
}
