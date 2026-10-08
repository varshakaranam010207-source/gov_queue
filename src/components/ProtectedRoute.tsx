import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/types';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-govnavy-900 flex items-center justify-center shadow-lg mb-4 text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-lg font-semibold text-govnavy-900">Verifying Identity & Credentials</h2>
        <p className="text-sm text-slate-500 mt-1">Connecting securely to GovQueue AI...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // If attempting to access staff or admin, route to /internal, otherwise to /login
    const isPersonnelRoute = location.pathname.startsWith('/staff') || location.pathname.startsWith('/admin');
    const redirectTarget = isPersonnelRoute ? '/internal' : '/login';
    return <Navigate to={redirectTarget} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role mismatch:
    if (user.role === 'CITIZEN') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'STAFF') {
      return <Navigate to="/staff" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
