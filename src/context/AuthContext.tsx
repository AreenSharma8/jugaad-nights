import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  outlet_id: string;
  role?: string;
  roles?: any[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user for testing (auth disabled)
  const MOCK_TEST_USER: User = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'manager@jugaadnights.com',
    name: 'Manager User',
    phone: '+91-9876543211',
    outlet_id: '550e8400-e29b-41d4-a716-446655440102',
    role: 'manager',
    roles: ['manager', 'staff'],
  };

  const MOCK_TEST_TOKEN = 'dev.mock-test-token-for-bypass';

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    try {
      // ⚠️ TEST MODE: Auto-login if no stored auth
      if (!storedToken || !storedUser || storedUser === "undefined") {
        // Auto-login with mock user for testing (auth disabled)
        setUser(MOCK_TEST_USER);
        setToken(MOCK_TEST_TOKEN);
        localStorage.setItem("auth_token", MOCK_TEST_TOKEN);
        localStorage.setItem("user", JSON.stringify(MOCK_TEST_USER));
        apiClient.setAuthToken(MOCK_TEST_TOKEN);
      } else {
        // Parse stored user safely
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        apiClient.setAuthToken(storedToken);
      }
    } catch (error) {
      // If storage is corrupted, use mock user
      console.warn('Auth storage error, using mock user:', error);
      setUser(MOCK_TEST_USER);
      setToken(MOCK_TEST_TOKEN);
      localStorage.setItem("auth_token", MOCK_TEST_TOKEN);
      localStorage.setItem("user", JSON.stringify(MOCK_TEST_USER));
      apiClient.setAuthToken(MOCK_TEST_TOKEN);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiClient.login(email, password);

      if (response.data.status === "success") {
        const { user: userData, token: authToken } = response.data.data;

        setUser(userData);
        setToken(authToken);

        localStorage.setItem("auth_token", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

        apiClient.setAuthToken(authToken);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    apiClient.setAuthToken("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
