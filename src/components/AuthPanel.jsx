import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPanel() {
  const { isConfigured, loading, user, signIn, signOut, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('signup');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/designer');
    }
  }, [user, navigate]);

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

  const handleGoogleSignIn = async () => {
    setError('');
    setStatus('');
    try {
      const { error: googleError } = await signInWithGoogle();
      if (googleError) throw googleError;
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
    }
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
            Your session is secure. Head over to the Designer workspace to build, simulate, and analyze your bio-electronic devices.
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
          Sign up to access your private beta workspace, save your bio-electronic layouts, and collaborate with your team.
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

      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line/10"></div>
        </div>
        <div className="relative bg-paper px-3 text-[10px] font-mono uppercase text-muted tracking-widest">
          or
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="google-auth-btn"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.11c-.22-.67-.35-1.39-.35-2.11s.13-1.44.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.86-2.59 3.29-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>



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

