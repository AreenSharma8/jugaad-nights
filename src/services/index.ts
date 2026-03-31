/**
 * Service Layer Exports
 * Core API client and authentication services
 */

export { apiClient, ApiError, type ApiResponse } from './api.client';
export { authService, type User, type AuthToken, type LoginResponse } from './auth.service';
export { authApi } from './authApi.service';
