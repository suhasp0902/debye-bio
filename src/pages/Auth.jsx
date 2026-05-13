import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/designer');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-surface border border-border rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-lg flex items-center justify-center mb-4 border border-accent-primary/20">
            <Activity className="w-6 h-6 text-accent-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary uppercase tracking-wider">
            Debye <span className="text-accent-primary">Bio</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Professional Bio-Electronics EDA</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-tight block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-tight block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-accent-error/10 border border-accent-error/20 rounded-lg text-accent-error text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
