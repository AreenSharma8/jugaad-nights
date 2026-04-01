/**
 * API Client Configuration
 * Centralized HTTP client with interceptors for authentication and error handling
 */

// Determine API base URL
// Priority:
// 1. VITE_API_URL environment variable (if set)
// 2. Development mode: Use /api (Vite proxy will intercept)
// 3. Production: Use /api (nginx will proxy to backend)
const getApiBaseUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    // If it's an absolute URL, use as-is
    if (import.meta.env.VITE_API_URL.startsWith('http')) {
      console.log('📡 [API] Using absolute URL:', import.meta.env.VITE_API_URL);
      return import.meta.env.VITE_API_URL;
    }
    // If it's a relative path (starts with /), use as-is
    if (import.meta.env.VITE_API_URL.startsWith('/')) {
      console.log('📡 [API] Using relative path:', import.meta.env.VITE_API_URL);
      return import.meta.env.VITE_API_URL;
    }
  }

  // Default: Use relative path that works everywhere
  // In dev: Vite proxy intercepts /api
  // In Docker: Nginx proxies /api to backend
  // In production: Same-origin /api requests
  console.log('📡 [API] Using default relative path: /api');
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

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

  // Always include Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('📡 [API] Request with auth:', endpoint);
  } else {
    console.log('📡 [API] Request without auth:', endpoint);
  }

  try {
    console.log('📤 [API Send]', {
      method: options.method || 'GET',
      url,
      endpoint,
    });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📥 [API Response]', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
    });

    const data: ApiResponse<T> | ApiErrorResponse = await response.json();

    if (!response.ok) {
      console.error('❌ [API Error]', {
        endpoint,
        status: response.status,
        message: (data as ApiErrorResponse).message,
      });
      throw new ApiError(
        response.status,
        (data as ApiErrorResponse).code || 'UNKNOWN_ERROR',
        (data as ApiErrorResponse).message || `HTTP ${response.status}`,
        data
      );
    }

    if (data.status === 'error') {
      console.error('❌ [API Response Error]', {
        endpoint,
        code: (data as ApiErrorResponse).code,
        message: (data as ApiErrorResponse).message,
      });
      throw new ApiError(
        response.status,
        (data as ApiErrorResponse).code || 'API_ERROR',
        (data as ApiErrorResponse).message || 'An error occurred',
        data
      );
    }

    console.log('✅ [API Success]', endpoint);
    return (data as ApiResponse<T>).data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('🚨 [API ApiError]', error.message);
      throw error;
    }

    if (error instanceof TypeError) {
      console.error('🚨 [API NetworkError]', error.message);
      throw new ApiError(0, 'NETWORK_ERROR', 'Network request failed', error);
    }

    console.error('🚨 [API UnknownError]', String(error));
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
