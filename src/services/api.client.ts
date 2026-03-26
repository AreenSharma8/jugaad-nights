/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code: string;
  timestamp: string;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request handler with error handling
 */
async function makeRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> | ApiErrorResponse = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        (data as ApiErrorResponse).code || 'UNKNOWN_ERROR',
        (data as ApiErrorResponse).message || `HTTP ${response.status}`,
        data
      );
    }

    if (data.status === 'error') {
      throw new ApiError(
        response.status,
        (data as ApiErrorResponse).code || 'API_ERROR',
        (data as ApiErrorResponse).message || 'An error occurred',
        data
      );
    }

    return (data as ApiResponse<T>).data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', error);
    }

    throw new ApiError(0, 'UNKNOWN_ERROR', String(error), error);
  }
}

/**
 * API Client Methods
 */
export const apiClient = {
  get: <T = any>(endpoint: string) =>
    makeRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any) =>
    makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    makeRequest<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
export default apiClient;
