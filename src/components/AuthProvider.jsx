import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../lib/auth-context';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user || null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      isConfigured: isSupabaseConfigured,
      loading,
      session,
      user,
      signUp: async ({ email, password, fullName, company }) => {
        if (!supabase) throw new Error('Supabase is not configured.');

        return supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: fullName,
              company,
              signup_source: 'landing_page',
            },
          },
        });
      },
      signIn: async ({ email, password }) => {
        if (!supabase) throw new Error('Supabase is not configured.');

        return supabase.auth.signInWithPassword({ email, password });
      },
      signOut: async () => {
        if (!supabase) return { error: null };

        return supabase.auth.signOut();
      },
    }),
    [loading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
