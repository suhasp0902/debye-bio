import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await resetPassword(email);
      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Reset link sent" subtitle="Check your inbox">
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
              <Mail size={32} />
            </div>
          </div>
          <p className="text-muted leading-relaxed mb-8">
            If an account exists for <strong className="text-ink">{email}</strong>, you'll receive a password reset link shortly.
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
    <AuthLayout title="Password Recovery" subtitle="Restore access to Debye">
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="text-sm text-muted mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
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

        {error && <div className="auth-error text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 mt-2">{error}</div>}

        <button 
          className="auth-submit w-full mt-4" 
          type="submit" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send reset link'}
          {!loading && <ArrowRight size={18} />}
        </button>

        <div className="mt-6 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted hover:text-blue transition-colors">
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
