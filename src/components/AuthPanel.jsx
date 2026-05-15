import { useState } from 'react';
import { ArrowRight, CheckCircle2, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPanel() {
  const { isConfigured, loading, user, signIn, signOut, signUp } = useAuth();
  const [mode, setMode] = useState('signup');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    if (!isConfigured) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live auth.');
      return;
    }

    setSubmitting(true);

    try {
      const result =
        mode === 'signup'
          ? await signUp({ email, password, fullName, company })
          : await signIn({ email, password });

      if (result.error) throw result.error;

      setPassword('');
      setStatus(
        mode === 'signup'
          ? 'Account created. If email confirmation is enabled, check your inbox before signing in.'
          : 'Signed in. Your session is active on this browser.',
      );
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setError('');
    setStatus('');
    const { error: signOutError } = await signOut();

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    setStatus('Signed out.');
  };

  if (loading) {
    return (
      <div className="auth-panel">
        <div className="auth-loading">Checking secure session...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-panel auth-panel-session">
        <div className="auth-icon">
          <UserRound size={22} />
        </div>
        <div>
          <p className="auth-kicker">Secure workspace unlocked</p>
          <h3>{user.email}</h3>
          <p>
            This is a live Supabase Auth session. Users appear in your Supabase dashboard under
            Authentication.
          </p>
        </div>
        <button className="auth-submit auth-secondary-action" type="button" onClick={handleSignOut}>
          <LogOut size={18} />
          Sign out
        </button>
        {status && <div className="auth-status">{status}</div>}
        {error && <div className="auth-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-copy">
        <p className="auth-kicker">Private beta access</p>
        <h3>Start a real Debye account.</h3>
        <p>
          Signup and login are wired to Supabase Auth, so user records, sessions, and confirmation
          emails can be managed from your Supabase project.
        </p>
      </div>

      <div className="auth-toggle" aria-label="Authentication mode">
        <button
          className={mode === 'signup' ? 'active' : ''}
          type="button"
          onClick={() => setMode('signup')}
        >
          Sign up
        </button>
        <button
          className={mode === 'login' ? 'active' : ''}
          type="button"
          onClick={() => setMode('login')}
        >
          Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'signup' && (
          <>
            <label>
              Full name
              <input
                autoComplete="name"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Suhas Patil"
                type="text"
                value={fullName}
              />
            </label>
            <label>
              Company or lab
              <input
                autoComplete="organization"
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Debye Bio"
                type="text"
                value={company}
              />
            </label>
          </>
        )}

        <label>
          Work email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            required
            type="password"
            value={password}
          />
        </label>

        <button className="auth-submit" disabled={submitting} type="submit">
          {submitting ? 'Working...' : mode === 'signup' ? 'Create account' : 'Login'}
          <ArrowRight size={18} />
        </button>
      </form>

      {!isConfigured && (
        <div className="auth-config-note">
          <ShieldCheck size={18} />
          Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` locally and in Vercel to activate
          live auth.
        </div>
      )}
      {status && (
        <div className="auth-status">
          <CheckCircle2 size={18} />
          {status}
        </div>
      )}
      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}

