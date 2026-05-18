import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import OAuthSection from '../components/OAuthSection';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/designer');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) throw signInError;
      navigate('/designer');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your workspace">
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Work email
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        
        <label>
          <div className="flex justify-between items-center">
            <span>Password</span>
            <Link to="/forgot-password" style={{ color: 'var(--blue)', fontSize: '0.8rem' }}>Forgot?</Link>
          </div>
          <input
            type="password"
            placeholder="Your secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <div className="auth-error text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 mt-2">{error}</div>}

        <button 
          className="auth-submit w-full mt-4" 
          type="submit" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <OAuthSection />

      <div className="mt-8 text-center text-sm text-muted">
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--blue)', fontWeight: 'bold' }}>Sign up</Link>
      </div>
    </AuthLayout>
  );
}
