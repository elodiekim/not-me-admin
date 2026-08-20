import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthStatus } from './auth-context';

// A signed-in Supabase session isn't enough — only profiles.is_admin grants
// access. A valid account without admin rights must never reach the
// dashboard, even for an instant, so this checks and signs back out on any
// session (fresh sign-in or one restored from a prior visit).
async function isAdminSession(session: Session): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', session.user.id)
    .single();

  return !error && data?.is_admin === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function evaluate(session: Session | null) {
      if (!session) {
        if (!cancelled) {
          setStatus('signed-out');
          setUserId(null);
        }
        return;
      }

      const admin = await isAdminSession(session);
      if (cancelled) return;

      if (admin) {
        setStatus('signed-in');
        setUserId(session.user.id);
      } else {
        await supabase.auth.signOut();
        if (!cancelled) {
          setStatus('signed-out');
          setUserId(null);
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => evaluate(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluate(session);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return { error: 'Invalid email or password' };
    }

    const admin = await isAdminSession(data.session);
    if (!admin) {
      await supabase.auth.signOut();
      return { error: 'Not authorized' };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status, userId, signIn, signOut }),
    [status, userId, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
