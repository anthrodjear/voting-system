'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { login as authLogin, logout as authLogout, refreshToken, updateProfile as authUpdateProfile } from '@/services/auth';
import type { User, UserRole } from '@/types';

interface LoginCredentials {
  identifier: string;
  password: string;
  userType?: 'voter' | 'ro' | 'admin';
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  admin: [
    'dashboard.view',
    'elections.manage',
    'candidates.manage',
    'counties.manage',
    'ro.manage',
    'reports.view',
    'audit.view',
    'settings.manage'
  ],
  returning_officer: [
    'dashboard.view',
    'voters.manage',
    'candidates.view',
    'subro.manage',
    'elections.manage',
    'reports.view',
    'settings.manage'
  ],
  sub_ro: [
    'dashboard.view',
    'voters.view',
    'voters.register',
    'candidates.view',
    'reports.view'
  ],
  voter: [
    'dashboard.view',
    'vote.cast',
    'profile.view',
    'profile.update'
  ]
};

/**
 * Authentication hook for managing user authentication state
 * and providing authentication-related functions.
 */
export function useAuth() {
  const router = useRouter();
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading: storeLoading,
    sessionExpiresAt,
    login: storeLogin,
    logout: storeLogout,
    updateUser,
    setLoading,
    checkSession
  } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize loading state
  useEffect(() => {
    setIsLoading(storeLoading);
  }, [storeLoading]);
  
  /**
   * Login with credentials
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authLogin(credentials);
      storeLogin(response.user, response.token, response.expiresIn);
      return response.user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [storeLogin]);
  
  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await authLogout();
    } catch {
      // Ignore logout errors
    } finally {
      storeLogout();
      router.push('/login');
    }
  }, [storeLogout, router]);
  
  /**
   * Check if user has a specific permission
   */
  const checkPermission = useCallback((permission: string): boolean => {
    if (!user || !user.role) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) return true;
    
    // Check for exact match
    if (userPermissions.includes(permission)) return true;
    
    // Check for wildcard match (e.g., 'elections.*' matches 'elections.manage')
    const [resource] = permission.split('.');
    return userPermissions.some(p => p === resource || p.startsWith(resource + '.*'));
  }, [user]);
  
  /**
   * Check if user has required role
   */
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);
  
  /**
   * Refresh user session
   */
  const refreshSession = useCallback(async () => {
    if (!token) return false;
    
    try {
      await refreshToken();
      return true;
    } catch {
      storeLogout();
      return false;
    }
  }, [token, storeLogout]);
  
  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await authUpdateProfile(data);
      updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);
  
  /**
   * Get user display name
   */
  const getDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }, [user]);
  
  /**
   * Get user initials
   */
  const getInitials = useCallback(() => {
    if (!user) return 'G';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }, [user]);
  
  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    sessionExpiresAt,
    
    // Actions
    login,
    logout,
    updateProfile,
    refreshSession,
    checkSession,
    
    // Helpers
    checkPermission,
    hasRole,
    getDisplayName,
    getInitials,
    
    // Setters
    setLoading
  };
}

export default useAuth;
