import { NextRequest } from 'next/server';

export function isAdminRequest(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  // Check server-only ADMIN_PASSWORD first, fall back to NEXT_PUBLIC_ for local dev
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (!adminPassword || !authHeader) return false;
  return authHeader === `Admin ${adminPassword}`;
}
