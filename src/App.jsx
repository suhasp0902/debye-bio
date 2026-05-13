import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './pages/LandingPage';
import Designer from './pages/Designer';
import Auth from './pages/Auth';

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProtectedRoute: Initializing auth check...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Supabase getSession error:', error);
      console.log('ProtectedRoute: Session found:', !!session);
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('ProtectedRoute: Auth state changed. Session:', !!session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-text-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-mono tracking-widest uppercase">Initializing Debye Secure Environment...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    console.log('ProtectedRoute: No session, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Clone children to pass sign out handler
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onSignOut: handleSignOut });
    }
    return child;
  });

  return childrenWithProps;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/designer" 
          element={
            <ProtectedRoute>
              <Designer />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
