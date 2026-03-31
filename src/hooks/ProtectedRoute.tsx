/**
 * Protected Route Component - SIMPLE & SECURE
 * 
 * Restricts access to routes based on authentication and roles
 * 
 * Security:
 * - Waits for auth initialization before rendering anything
 * - Redirects unauthenticated users to login
 * - Enforcesrole-based access control
 * - Prevents redirect loops by checking isLoading first
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[]; // If empty, any authenticated user can access
  requiredRole?: string; // Single role check (convenience prop)
}

/**
 * ProtectedRoute component for role-based access control
 * 
 * Three states:
 * 1. LOADING: Show spinner (auth is initializing)
 * 2. NOT AUTHENTICATED: Redirect to /login
 * 3. AUTHENTICATED: Check roles, then render
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, hasAnyRole, user } = useAuth();

  // Convert single role to roles array
  const rolesToCheck = requiredRole ? [requiredRole] : requiredRoles;

  /**
   * STATE 1: LOADING
   * Auth system is initializing (checking localStorage, verifying token)
   * Show spinner to prevent redirect loops
   * 
   * Why: If we redirect before auth is ready, we might send unauthed users to login
   * even though they have a valid token that's being verified
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * STATE 2: NOT AUTHENTICATED
   * User has no valid token/verified user
   * Redirect to login (with force=true for testing account switching)
   * 
   * Why force=true: Allows users to manually access login and switch accounts
   */
  if (!isAuthenticated) {
    return <Navigate to="/login?force=true" replace />;
  }

  /**
   * STATE 3: AUTHENTICATED - Check role-based access
   * If specific roles required, verify user has at least one of them
   */
  const hasAccess =
    !rolesToCheck || rolesToCheck.length === 0
      ? true // No specific role required, just authenticated
      : hasAnyRole(rolesToCheck);

  // Role check failed - show access denied
  if (rolesToCheck && rolesToCheck.length > 0 && !hasAccess) {
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

  // ✅ User is authenticated and authorized - render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
