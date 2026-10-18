// Server-only auth for /api/cron/* routes.
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

// Accepts the secret as Vercel Cron sends it (Authorization: Bearer <CRON_SECRET>)
// or as an x-cron-secret header. Rejects everything when CRON_SECRET isn't set.
export function isCronRequest(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const auth = req.headers.get('authorization');
  const provided =
    req.headers.get('x-cron-secret') ??
    (auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null);
  if (!provided) return false;

  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
