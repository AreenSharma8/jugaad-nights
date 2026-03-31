/**
 * Protected Route Component
 * Restricts access to routes based on authentication and roles
 */

import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // If empty, any authenticated user can access
  requiredRole?: string; // Single role check (convenience prop)
}

/**
 * ProtectedRoute component for role-based access control
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, hasAnyRole, user } = useAuth();

  // Convert single role to roles array
  const rolesToCheck = requiredRole ? [requiredRole] : requiredRoles;

  // Memoize role check to prevent re-computation
  const hasAccess = useMemo(() => {
    if (!rolesToCheck || rolesToCheck.length === 0) {
      return true; // No specific role required, just authenticated
    }
    return hasAnyRole(rolesToCheck);
  }, [rolesToCheck, hasAnyRole]);

  // 🔥 Safety check - prevent redirect loop during auth initialization
  if (isLoading) {
    return null; // Return nothing, don't render loading circle (prevents routing flicker)
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.warn('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (rolesToCheck && rolesToCheck.length > 0) {
    if (!hasAccess) {
      console.warn('ProtectedRoute: User lacks required roles', {
        required: rolesToCheck,
        userRoles: user?.roles,
        userRole: user?.role,
      });
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required roles: {rolesToCheck.join(', ')}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Your roles: {user?.roles?.join(', ') || 'none'} (Primary: {user?.role || 'none'})
            </p>
          </div>
        </div>
      );
    }
  }

  // User is authorized
  return <>{children}</>;
};

export default ProtectedRoute;
