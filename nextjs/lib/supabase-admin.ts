// Server-only admin client — NEVER import this in client components
// Uses SUPABASE_SERVICE_ROLE_KEY which is only available server-side
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = createClient<any>(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// Verify a JWT and return the user (for API route auth)
export async function getUserFromToken(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
