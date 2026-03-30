// ===========================================
// AUTH STORE
// Location: src/stores/auth.store.ts
// ===========================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiresAt: number | null;
  
  // Actions
  login: (user: User, token: string, expiresIn?: number) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      sessionExpiresAt: null,

      login: (user: User, token: string, expiresIn = 7200000) => { // 2 hours default
        const sessionExpiresAt = Date.now() + expiresIn;
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          sessionExpiresAt,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          sessionExpiresAt: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkSession: () => {
        const { sessionExpiresAt, isAuthenticated } = get();
        if (!isAuthenticated || !sessionExpiresAt) return false;
        
        if (Date.now() > sessionExpiresAt) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        // Set isLoading to false after rehydration completes
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
