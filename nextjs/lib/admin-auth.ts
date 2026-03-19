import { NextRequest } from 'next/server';

export function isAdminRequest(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (!adminPassword || !authHeader) return false;
  return authHeader === `Admin ${adminPassword}`;
}
