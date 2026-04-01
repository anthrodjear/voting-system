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
  identifier: string;
  password: string;
  userType?: 'voter' | 'ro' | 'admin';
}

export interface BackendLoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requiresMfa: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterData {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  county?: string;
  constituency?: string;
  ward?: string;
  phoneNumber: string;
  email?: string;
}

// ===========================================
// AUTH SERVICE FUNCTIONS
// ===========================================

/**
 * Login with identifier (national ID for voters, email for RO/admin) and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post<BackendLoginResponse>('/auth/login', credentials);

    // Backend returns accessToken, not token - map it
    const token = response.accessToken;
    const expiresIn = response.expiresIn * 1000; // Convert seconds to ms

    // Build user from token first (so we can store token immediately)
    const user = buildUserFromToken(token, credentials.userType || 'voter');

    // Store auth data in store BEFORE fetching profile (so interceptor can attach token)
    useAuthStore.getState().login(user, token, expiresIn);

    // Store refresh token in localStorage for token refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }

    // Try to fetch full user profile (now that token is stored)
    try {
      const profileResponse = await api.get<ApiResponse<User>>('/auth/me');
      if (profileResponse.data) {
        useAuthStore.getState().updateUser(profileResponse.data);
      }
    } catch {
      // Profile fetch failed, but login still succeeds with token-based user
    }

    return {
      user: useAuthStore.getState().user || user,
      token,
      refreshToken: response.refreshToken,
      expiresIn,
    };
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
export async function refreshToken(): Promise<{ token: string; expiresIn: number }> {
  try {
    const storedRefreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

    if (!storedRefreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: storedRefreshToken,
    });

    const token = response.accessToken;
    const expiresIn = response.expiresIn * 1000;

    // Update auth store with new token
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.getState().login(currentUser, token, expiresIn);
    }

    return { token, expiresIn };
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
 * Register a new voter
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.post<ApiResponse<{ id: string }>>('/voters/register', data);

    // Backend creates voter but doesn't auto-login
    // Return a minimal response - user needs to login after registration
    const mockUser: User = {
      id: response.data?.id || '',
      email: data.email || '',
      role: 'voter',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phoneNumber,
      county: data.county,
      constituency: data.constituency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      user: mockUser,
      token: '',
      refreshToken: '',
      expiresIn: 0,
    };
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

  return true;
}

/**
 * Build a minimal user object from JWT token claims
 */
function buildUserFromToken(token: string, userType: string): User {
  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub || '',
      email: payload.email || '',
      role: userType === 'admin' ? 'super_admin' : (userType as User['role']),
      firstName: '',
      lastName: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      id: '',
      email: '',
      role: 'voter',
      firstName: '',
      lastName: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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
