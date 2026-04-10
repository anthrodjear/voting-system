import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: 'voter' | 'admin' | 'ro' | 'superadmin';
  nationalId?: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
}));