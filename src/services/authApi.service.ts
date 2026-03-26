/**
 * Authentication API Service
 * Handles authentication-related API calls including login and signup
 */

import { apiClient } from './api.client';
import { LoginResponse } from './auth.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
  gender?: string;
  age?: number;
  department?: string;
}

export interface CustomerSignupCredentials extends SignupCredentials {
  user_type: 'customer';
}

export interface StaffSignupCredentials extends SignupCredentials {
  user_type: 'staff';
  role_id?: string;
}

export interface AdminSignupCredentials extends SignupCredentials {
  user_type: 'admin';
}

export const authApi = {
  /**
   * Authenticate user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Customer signup - Public registration
   */
  signupCustomer: async (credentials: CustomerSignupCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/signup/customer', credentials);
  },

  /**
   * Staff signup - Controlled by admin
   */
  signupStaff: async (credentials: StaffSignupCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/signup/staff', credentials);
  },

  /**
   * Admin signup - System initialization
   */
  signupAdmin: async (credentials: AdminSignupCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/signup/admin', credentials);
  },

  /**
   * Logout user (if server-side logout is needed)
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Logout on client-side even if server call fails
      console.warn('Server logout failed:', error);
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/refresh');
  },

  /**
   * Verify token validity
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default authApi;
