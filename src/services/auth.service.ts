/**
 * Authentication Service
 * Handles token storage, user data, and authentication state
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  outlet_id: string;
  role: string;
  roles: string[];
  user_type: 'admin' | 'staff' | 'customer';
  gender?: string;
  age?: number;
  department?: string;
  is_active?: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt?: number;
}

export interface LoginResponse {
  user: User;
  token: string;
}

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';
const AUTH_EXPIRES_KEY = 'auth_expires';

export const authService = {
  /**
   * Save authentication data to localStorage
   */
  setAuth: (authData: LoginResponse) => {
    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));

    // Decode JWT to get expiration (if it's a real JWT)
    try {
      const parts = authData.token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          localStorage.setItem(AUTH_EXPIRES_KEY, String(payload.exp * 1000));
        }
      }
    } catch (e) {
      // Token is not a valid JWT or parsing failed
    }
  },

  /**
   * Get stored token from localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored user data from localStorage
   */
  getUser: (): User | null => {
    try {
      const userJson = localStorage.getItem(AUTH_USER_KEY);
      // Handle edge cases where storage might contain 'undefined' string or empty values
      if (!userJson || userJson === 'undefined' || userJson === '') {
        return null;
      }
      return JSON.parse(userJson);
    } catch (error) {
      // If parsing fails, clear the corrupted data
      console.warn('Failed to parse stored user data:', error);
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (): boolean => {
    const expiresAt = localStorage.getItem(AUTH_EXPIRES_KEY);
    if (!expiresAt) return false;
    return Date.now() > Number(expiresAt);
  },

  /**
   * Check if user has a specific role
   */
  hasRole: (role: string): boolean => {
    const user = authService.getUser();
    return user ? user.roles.includes(role) : false;
  },

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (roles: string[]): boolean => {
    const user = authService.getUser();
    return user ? roles.some((role) => user.roles.includes(role)) : false;
  },

  /**
   * Check if user has all specified roles
   */
  hasAllRoles: (roles: string[]): boolean => {
    const user = authService.getUser();
    return user ? roles.every((role) => user.roles.includes(role)) : false;
  },

  /**
   * Get user's primary role
   */
  getRole: (): string | null => {
    const user = authService.getUser();
    return user?.role || null;
  },

  /**
   * Get user's outlet ID
   */
  getOutletId: (): string | null => {
    const user = authService.getUser();
    return user?.outlet_id || null;
  },

  /**
   * Clear authentication data
   */
  clearAuth: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_EXPIRES_KEY);
  },
};

export default authService;
