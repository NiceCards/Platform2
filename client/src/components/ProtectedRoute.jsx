import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconSpinner } from './icons';

/**
 * Guards user routes. Redirects to /login when not authenticated.
 * Supports both <Outlet/> (nested routes) and <ProtectedRoute><Page/></ProtectedRoute>.
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <IconSpinner size={32} className="text-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children ?? <Outlet />;
};
