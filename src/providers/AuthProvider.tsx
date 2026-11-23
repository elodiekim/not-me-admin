import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthStatus } from './auth-context';

async function fetchAdminProfile(session: Session): Promise<{ name: string; isDemoReadonly: boolean } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin, name, is_demo_readonly')
    .eq('id', session.user.id)
    .single();

  if (error || data?.is_admin !== true) return null;
  return { name: data.name, isDemoReadonly: data.is_demo_readonly };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isDemoReadonly, setIsDemoReadonly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function evaluate(session: Session | null) {
      if (!session) {
        if (!cancelled) {
          setStatus('signed-out');
          setUserId(null);
          setUserName(null);
          setIsDemoReadonly(false);
        }
        return;
      }

      const adminProfile = await fetchAdminProfile(session);
      if (cancelled) return;

      if (adminProfile) {
        setStatus('signed-in');
        setUserId(session.user.id);
        setUserName(adminProfile.name);
        setIsDemoReadonly(adminProfile.isDemoReadonly);
      } else {
        await supabase.auth.signOut();
        if (!cancelled) {
          setStatus('signed-out');
          setUserId(null);
          setUserName(null);
          setIsDemoReadonly(false);
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

    const adminProfile = await fetchAdminProfile(data.session);
    if (!adminProfile) {
      await supabase.auth.signOut();
      return { error: 'Not authorized' };
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status, userId, userName, isDemoReadonly, signIn, signOut }),
    [status, userId, userName, isDemoReadonly, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
