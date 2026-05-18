import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../lib/auth-context';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
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
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: fullName,
              company,
              signup_source: 'web_app',
            },
          },
        });
      },
      signIn: async ({ email, password }) => {
        if (!supabase) throw new Error('Supabase is not configured.');

        return supabase.auth.signInWithPassword({ email, password });
      },
      signInWithGoogle: async () => {
        if (!supabase) throw new Error('Supabase is not configured.');
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/designer`,
          },
        });
      },
      signInWithGithub: async () => {
        if (!supabase) throw new Error('Supabase is not configured.');
        return supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/designer`,
          },
        });
      },
      resetPassword: async (email) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        return supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      },
      updatePassword: async (newPassword) => {
        if (!supabase) throw new Error('Supabase is not configured.');
        return supabase.auth.updateUser({ password: newPassword });
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
