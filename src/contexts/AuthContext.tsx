/**
 * Authentication Context
 * Provides authentication state and methods to the entire application
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService, authApi, type User, type LoginResponse } from '@/services';
import type { CustomerSignupCredentials, StaffSignupCredentials, AdminSignupCredentials } from '@/services/authApi.service';

export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
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
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getUser();

        if (storedToken && storedUser) {
          // Verify token is still valid
          try {
            await authApi.verifyToken();
            setToken(storedToken);
            setUser(storedUser);
          } catch (error) {
            // Token is invalid, clear auth
            authService.clearAuth();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login handler
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 [AuthContext] Starting login with email:', email);
      const apiResponse = await authApi.login({ email, password });
      
      console.log('🔍 [AuthContext] API response received:', apiResponse);

      // Transform and validate response
      const response = transformAuthResponse(apiResponse);
      console.log('🔍 [AuthContext] Transformed response:', response);

      // Store in localStorage and state
      console.log('🔍 [AuthContext] Calling authService.setAuth...');
      authService.setAuth(response);
      
      // Verify storage
      const storedUserTest = authService.getUser();
      console.log('🔍 [AuthContext] Verified storage:', storedUserTest);

      setToken(response.token);
      setUser(response.user);
      
      console.log('✅ [AuthContext] Login successful');
    } catch (err: any) {
      console.error('❌ [AuthContext] login() error:', err);
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Customer signup handler
   */
  const signupCustomer = useCallback(async (credentials: CustomerSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupCustomer(credentials);
      const response = transformAuthResponse(apiResponse);

      // Store in localStorage and state
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.message || 'Customer signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Staff signup handler
   */
  const signupStaff = useCallback(async (credentials: StaffSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupStaff(credentials);
      const response = transformAuthResponse(apiResponse);

      // Store in localStorage and state
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.message || 'Staff signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Admin signup handler
   */
  const signupAdmin = useCallback(async (credentials: AdminSignupCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiResponse = await authApi.signupAdmin(credentials);
      const response = transformAuthResponse(apiResponse);

      // Store in localStorage and state
      authService.setAuth(response);
      setToken(response.token);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.message || 'Admin signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(() => {
    authService.clearAuth();
    setToken(null);
    setUser(null);
    setError(null);
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

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
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
