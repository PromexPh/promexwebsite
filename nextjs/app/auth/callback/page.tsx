'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role') ?? 'candidate';

    async function handleCallback() {
      // detectSessionInUrl: true handles the code/token exchange automatically.
      // Try to get session immediately; if not ready yet, wait for SIGNED_IN.
      const { data: { session } } = await supabase.auth.getSession();

      async function finalise(s: NonNullable<typeof session>) {
        const existingRole = s.user.user_metadata?.role as string | undefined;
        const role = existingRole ?? roleParam;

        // Persist role in user_metadata if not already set
        if (!existingRole) {
          await supabase.auth.updateUser({ data: { role } });
        }

        router.replace(role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard');
      }

      if (session) {
        await finalise(session);
        return;
      }

      // Session not yet available — wait for auth state change (PKCE exchange in progress)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        if (s) {
          subscription.unsubscribe();
          finalise(s);
        }
      });

      // Safety fallback: if no session after 12s, go home
      setTimeout(() => {
        subscription.unsubscribe();
        router.replace('/');
      }, 12000);
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', fontFamily: 'sans-serif' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4FA3C7' }} aria-hidden="true" />
      <p style={{ color: '#6b7280', margin: 0 }}>Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  );
}
