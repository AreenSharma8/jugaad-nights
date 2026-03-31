/**
 * Authentication Context - SECURE & SIMPLE
 * 
 * Architecture:
 * - Token = unverified credential (from localStorage)
 * - VERIFIED token = actual authentication (after /auth/verify)
 * - Both token and user are set ATOMICALLY (together or not at all)
 * - localStorage is validated on app load, corrupted data is cleared
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService, authApi, type User, type LoginResponse } from '@/services';
import type { CustomerSignupCredentials, StaffSignupCredentials, AdminSignupCredentials } from '@/services/authApi.service';
import axiosApiClient from '@/lib/api';

export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean; // Only true if token is verified and valid
  isLoading: boolean;
  error: string | null;

  // Methods
  login: (email: string, password: string) => Promise<void>;
  signupCustomer: (credentials: CustomerSignupCredentials) => Promise<void>;
  signupStaff: (credentials: StaffSignupCredentials) => Promise<void>;
  signupAdmin: (credentials: AdminSignupCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;

  // Role checks
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  getUserType: () => string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Helper: Transform API response to expected format
 * Handles nested responses and role object→string conversion
 */
function transformAuthResponse(response: any): LoginResponse {
  // Unwrap if response was nested by interceptor
  let data = response;
  if (response.data && response.data.user && response.data.token) {
    data = response.data;
  }

  if (!data.user || !data.token) {
    throw new Error('Invalid response structure');
  }

  // Transform roles from objects to strings if needed
  if (Array.isArray(data.user.roles) && data.user.roles.length > 0) {
    if (typeof data.user.roles[0] === 'object' && data.user.roles[0].name) {
      data.user.roles = data.user.roles.map((r: any) => typeof r === 'string' ? r : r.name);
    }
  }

  return data as LoginResponse;
}

/**
 * Helper: Validate stored user structure before using
 * Prevents crashes from corrupted localStorage data
 */
function isValidUser(user: any): user is User {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.id === 'string' &&
    typeof user.email === 'string' &&
    typeof user.name === 'string' &&
    Array.isArray(user.roles)
  );
}

/**
 * Authentication Provider Component - SECURE INITIALIZATION
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * CRITICAL: Initialize auth state from localStorage with strict validation
   * 
   * Flow:
   * 1. Get stored token and user from localStorage
   * 2. ONLY if token exists: verify it's still valid via backend
   * 3. If valid: set BOTH token and user atomically
   * 4. If invalid/expired: clear localStorage completely
   * 5. Handle corrupted data gracefully
   * 
   * Why this is important:
   * - Prevents redirect loops (forces /dashboard on invalid token)
   * - Prevents unauthorized access (stale token treated as valid)
   * - Handles corrupted localStorage gracefully
   * - Ensures atomic state (no partial login)
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Step 1: Get stored credentials from localStorage
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        // Step 2: If token exists, verify it's still valid
        if (storedToken && storedUser) {
          try {
            // Validate stored user structure before using it
            // Prevents crashes from corrupted data
            if (!isValidUser(storedUser)) {
              console.warn('⚠️ Stored user data is corrupted, clearing localStorage');
              authService.clearAuth();
              setToken(null);
              setUser(null);
              return;
            }

            // Call backend to verify token is still valid
            // This is REQUIRED - don't trust localStorage alone
            await authApi.verifyToken();

            // Step 3: Token is valid, set state ATOMICALLY (together)
            // This prevents React rendering partial auth state
            setToken(storedToken);
            setUser(storedUser);
            axiosApiClient.setAuthToken(storedToken);
          } catch (error) {
            // Step 4: Token is invalid/expired, clear all auth data
            // This prevents unauthorized access with stale tokens
            console.warn('⚠️ Token validation failed, clearing auth state');
            authService.clearAuth();
            setToken(null);
            setUser(null);
            axiosApiClient.setAuthToken('');
          }
        }
        // If no stored token, user starts in logged-out state (nothing to do)
      } catch (error) {
        // Step 5: Unexpected error during initialization
        // Log and continue - app stays in logged-out state
        console.error('❌ Auth initialization failed:', error);
        authService.clearAuth();
        setToken(null);
        setUser(null);
        axiosApiClient.setAuthToken('');
      } finally {
        // Initialization complete - allow app to render
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Keep Axios client in sync with auth state used by fetch-based auth client.
  useEffect(() => {
    axiosApiClient.setAuthToken(token || '');
  }, [token]);

  /**
   * Login handler - ATOMIC STATE UPDATE
   * Sets token and user together to prevent partial auth state
   * Prevents redirect loops by having clean state after login
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.login({ email, password });
      const response = transformAuthResponse(apiResponse);

      // ATOMIC: Store credentials and update state together
      // Prevents React from rendering with just token but no user
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
      axiosApiClient.setAuthToken(response.token);
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Customer signup handler - ATOMIC STATE UPDATE
   */
  const signupCustomer = useCallback(async (credentials: CustomerSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupCustomer(credentials);
      const response = transformAuthResponse(apiResponse);

      // ATOMIC: Store and update state together
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
      axiosApiClient.setAuthToken(response.token);
    } catch (err: any) {
      const errorMessage = err?.message || 'Customer signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Staff signup handler - ATOMIC STATE UPDATE
   */
  const signupStaff = useCallback(async (credentials: StaffSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupStaff(credentials);
      const response = transformAuthResponse(apiResponse);

      // ATOMIC: Store and update state together
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
      axiosApiClient.setAuthToken(response.token);
    } catch (err: any) {
      const errorMessage = err?.message || 'Staff signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Admin signup handler - ATOMIC STATE UPDATE
   */
  const signupAdmin = useCallback(async (credentials: AdminSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupAdmin(credentials);
      const response = transformAuthResponse(apiResponse);

      // ATOMIC: Store and update state together
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
      axiosApiClient.setAuthToken(response.token);
    } catch (err: any) {
      const errorMessage = err?.message || 'Admin signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler - CLEAR ALL AUTH DATA
   * Ensures complete cleanup from both state and localStorage
   * Prevents redirect loop by clearing token first
   */
  const logout = useCallback(() => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
    setError(null);
    axiosApiClient.setAuthToken('');
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!user) return false;
    // Check both roles array and primary role (fallback)
    return user.roles.includes(role) || user.role === role;
  }, [user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    // Check if any role matches in roles array OR matches primary role
    return roles.some((role) => user.roles.includes(role) || user.role === role);
  }, [user]);

  /**
   * Check if user has all specified roles
   */
  const hasAllRoles = useCallback((roles: string[]): boolean => {
    if (!user) return false;
    // Check if all roles exist in roles array OR all match primary role (for single role)
    return roles.every((role) => user.roles.includes(role) || user.role === role);
  }, [user]);

  /**
   * Get user type
   */
  const getUserType = useCallback((): string | null => {
    return user?.user_type || null;
  }, [user]);

  // Build context value with VERIFIED authentication state
  // isAuthenticated = true ONLY if we have BOTH token AND verified user
  // This prevents dashboard access with partial auth state
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user, // Both must exist for true authentication
    isLoading,
    error,
    login,
    signupCustomer,
    signupStaff,
    signupAdmin,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getUserType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
