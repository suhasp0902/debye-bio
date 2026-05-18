import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await updatePassword(password);
      if (updateError) throw updateError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session && !success) {
    return (
      <AuthLayout title="Invalid Link" subtitle="Session expired">
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500">
              <ShieldAlert size={32} />
            </div>
          </div>
          <p className="text-muted leading-relaxed mb-8">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" title="Request new link" className="auth-submit w-full">
            Request new link
            <ArrowRight size={18} />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Updated" subtitle="Password reset complete">
        <div className="text-center py-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <p className="text-muted leading-relaxed mb-8">
            Your password has been updated successfully. You can now log in with your new credentials.
          </p>
          <Link to="/login" className="auth-submit w-full">
            Proceed to login
            <ArrowRight size={18} />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Secure Access" subtitle="Set your new password">
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="text-sm text-muted mb-4">
          Choose a strong password that you haven't used before.
        </p>
        
        <label>
          New password
          <input
            type="password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <label>
          Confirm new password
          <input
            type="password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        {error && <div className="auth-error text-xs p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 mt-2">{error}</div>}

        <button 
          className="auth-submit w-full mt-4" 
          type="submit" 
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update password'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </AuthLayout>
  );
}
