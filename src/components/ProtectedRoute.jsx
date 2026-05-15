import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component that redirects unauthenticated users to the landing page
 * specifically targeting the #access section.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // If auth is not configured, allow access (local development fallback)
  if (!isConfigured) {
    return children;
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
          <p className="text-sm font-medium animate-pulse">Establishing secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to landing page access section
    return <Navigate to="/#access" state={{ from: location }} replace />;
  }

  return children;
}
