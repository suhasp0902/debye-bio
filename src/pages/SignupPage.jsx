import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import OAuthSection from '../components/OAuthSection';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/designer');
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(formData);
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Success" subtitle="Check your email">
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <p className="text-muted leading-relaxed mb-8">
            We've sent a verification link to <strong className="text-ink">{formData.email}</strong>.<br />
            Please click the link to confirm your account and start designing.
          </p>
          <Link to="/login" className="auth-submit w-full">
            Back to login
            <ArrowRight size={18} />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Private Beta" subtitle="Create your Debye account">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label>
            Full name
            <input
              type="text"
              placeholder="Suhas Patil"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Company
            <input
              type="text"
              placeholder="Debye Bio"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
              autoComplete="organization"
            />
          </label>
        </div>
        
        <label>
          Work email
          <input
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
          />
        </label>
        
        <label>
          Password
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        {error && <div className="auth-error text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 mt-2">{error}</div>}

        <button 
          className="auth-submit w-full mt-4" 
          type="submit" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <OAuthSection />

      <div className="mt-8 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--blue)', fontWeight: 'bold' }}>Login</Link>
      </div>
    </AuthLayout>
  );
}
