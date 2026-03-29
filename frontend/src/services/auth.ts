// ===========================================
// AUTH SERVICE
// Location: src/services/auth.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import { useAuthStore } from '@/stores/auth.store';
import type { User, AuthResponse, ApiResponse } from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'voter' | 'returning_officer';
  county?: string;
  constituency?: string;
}

// ===========================================
// AUTH SERVICE FUNCTIONS
// ===========================================

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    // Store auth data in store
    useAuthStore.getState().login(
      response.user,
      response.token,
      response.expiresIn
    );
    
    // Store refresh token in localStorage for token refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Login failed');
    }
    throw error;
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Try to notify server (but don't fail if offline)
    await api.post('/auth/logout', {}, { skipRetry: true }).catch(() => {});
  } catch {
    // Ignore logout errors
  } finally {
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
    
    // Clear auth store
    useAuthStore.getState().logout();
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {});
    
    // Update auth store with new token
    useAuthStore.getState().login(
      useAuthStore.getState().user!,
      response.token,
      response.expiresIn
    );
    
    // Update refresh token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  } catch (error) {
    // If refresh fails, logout user
    useAuthStore.getState().logout();
    throw new Error('Session expired. Please login again.');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    
    if (response.data) {
      // Update user in store
      useAuthStore.getState().updateUser(response.data);
      return response.data;
    }
    
    throw new Error('Failed to fetch user');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get current user');
    }
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Store auth data in store
    useAuthStore.getState().login(
      response.user,
      response.token,
      response.expiresIn
    );
    
    // Store refresh token
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Registration failed');
    }
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(data: Partial<User>): Promise<User> {
  try {
    const response = await api.patch<ApiResponse<User>>('/auth/profile', data);
    
    if (response.data) {
      useAuthStore.getState().updateUser(response.data);
      return response.data;
    }
    
    throw new Error('Failed to update profile');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update profile');
    }
    throw error;
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  try {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to change password');
    }
    throw error;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await api.post('/auth/forgot-password', { email });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to request password reset');
    }
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  try {
    await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reset password');
    }
    throw error;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<void> {
  try {
    await api.post('/auth/verify-email', { token });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to verify email');
    }
    throw error;
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  try {
    await api.post('/auth/resend-verification');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
    throw error;
  }
}

/**
 * Check if user is authenticated and session is valid
 */
export async function validateSession(): Promise<boolean> {
  const { isAuthenticated, checkSession } = useAuthStore.getState();
  
  if (!isAuthenticated) {
    return false;
  }
  
  // Check if session is still valid (not expired)
  if (!checkSession()) {
    return false;
  }
  
  // Optionally verify with server
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
}

export default {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  register,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  validateSession,
};
