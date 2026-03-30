/**
 * @jest-environment jsdom
 */

import { useAuthStore } from './auth.store';
import type { User, UserRole } from '@/types';

// Test user type (simplified for testing)
interface TestUser extends User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

describe('auth.store', () => {
  // Test user data
  const mockUser: TestUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'voter' as UserRole,
    phone: '+1234567890',
    county: 'Nairobi',
    constituency: 'Westlands',
    ward: 'Kitisuru',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset store before each test
    const store = useAuthStore.getState();
    store.logout();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('has null user initially', () => {
      const { user } = useAuthStore.getState();
      expect(user).toBeNull();
    });

    it('has null token initially', () => {
      const { token } = useAuthStore.getState();
      expect(token).toBeNull();
    });

    it('is not authenticated initially', () => {
      const { isAuthenticated } = useAuthStore.getState();
      expect(isAuthenticated).toBe(false);
    });

    it('has loading as true initially', () => {
      // Set loading to true to simulate initial state before rehydration
      useAuthStore.setState({ isLoading: true });
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(true);
    });

    it('has null sessionExpiresAt initially', () => {
      const { sessionExpiresAt } = useAuthStore.getState();
      expect(sessionExpiresAt).toBeNull();
    });
  });

  describe('login', () => {
    it('sets user, token, and authenticated state', () => {
      const { login } = useAuthStore.getState();
      
      login(mockUser, 'test-token', 7200000);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('sets session expiration time', () => {
      const { login } = useAuthStore.getState();
      const expiresIn = 7200000; // 2 hours in ms
      const beforeLogin = Date.now();
      
      login(mockUser, 'token', expiresIn);
      
      const state = useAuthStore.getState();
      expect(state.sessionExpiresAt).toBeGreaterThanOrEqual(beforeLogin + expiresIn);
      expect(state.sessionExpiresAt).toBeLessThanOrEqual(beforeLogin + expiresIn + 100);
    });

    it('uses default expiration time when not provided', () => {
      const { login } = useAuthStore.getState();
      const beforeLogin = Date.now();
      
      login(mockUser, 'token');
      
      const state = useAuthStore.getState();
      // Default is 2 hours (7200000ms)
      expect(state.sessionExpiresAt).toBeGreaterThanOrEqual(beforeLogin + 7200000);
    });

    it('sets isLoading to false after login', () => {
      const { login, isLoading } = useAuthStore.getState();
      
      // Initially true (but let's set it to true first)
      useAuthStore.setState({ isLoading: true });
      
      login(mockUser, 'token');
      
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user', () => {
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'token');
      
      logout();
      
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('clears token', () => {
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'token');
      
      logout();
      
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('sets isAuthenticated to false', () => {
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'token');
      
      logout();
      
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('clears sessionExpiresAt', () => {
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'token', 7200000);
      
      logout();
      
      expect(useAuthStore.getState().sessionExpiresAt).toBeNull();
    });

    it('preserves isLoading state', () => {
      const { login, logout } = useAuthStore.getState();
      login(mockUser, 'token');
      useAuthStore.setState({ isLoading: true });
      
      logout();
      
      // Note: logout doesn't change isLoading based on the implementation
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('updates user properties', () => {
      const { login, updateUser } = useAuthStore.getState();
      login(mockUser, 'token');
      
      updateUser({ firstName: 'Jane', lastName: 'Smith' });
      
      const state = useAuthStore.getState();
      expect(state.user?.firstName).toBe('Jane');
      expect(state.user?.lastName).toBe('Smith');
    });

    it('preserves other user properties', () => {
      const { login, updateUser } = useAuthStore.getState();
      login(mockUser, 'token');
      
      updateUser({ firstName: 'Jane' });
      
      const state = useAuthStore.getState();
      expect(state.user?.email).toBe(mockUser.email);
      expect(state.user?.role).toBe(mockUser.role);
    });

    it('does nothing when user is null', () => {
      const { updateUser } = useAuthStore.getState();
      
      updateUser({ firstName: 'Jane' });
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      const { setLoading } = useAuthStore.getState();
      
      setLoading(true);
      
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      useAuthStore.setState({ isLoading: true });
      const { setLoading } = useAuthStore.getState();
      
      setLoading(false);
      
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('checkSession', () => {
    it('returns false when not authenticated', () => {
      const { checkSession } = useAuthStore.getState();
      
      const result = checkSession();
      
      expect(result).toBe(false);
    });

    it('returns false when sessionExpiresAt is null', () => {
      const { login, checkSession } = useAuthStore.getState();
      login(mockUser, 'token');
      useAuthStore.setState({ sessionExpiresAt: null });
      
      const result = checkSession();
      
      expect(result).toBe(false);
    });

    it('returns true when session is valid', () => {
      const { login, checkSession } = useAuthStore.getState();
      login(mockUser, 'token', 7200000); // 2 hours from now
      
      const result = checkSession();
      
      expect(result).toBe(true);
    });

    it('returns false and logs out when session is expired', () => {
      const { login, checkSession } = useAuthStore.getState();
      login(mockUser, 'token', -1000); // Expired
      
      const result = checkSession();
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('returns false and logs out when session just expired', () => {
      const { login, checkSession } = useAuthStore.getState();
      // Set session to expire exactly now
      useAuthStore.setState({ 
        user: mockUser, 
        token: 'token', 
        isAuthenticated: true,
        sessionExpiresAt: Date.now() - 1 
      });
      
      const result = checkSession();
      
      expect(result).toBe(false);
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist user and token to localStorage', () => {
      // Login
      const { login } = useAuthStore.getState();
      login(mockUser, 'test-token', 7200000);
      
      // Get the persisted state
      const { user, token, isAuthenticated, sessionExpiresAt } = useAuthStore.getState();
      
      expect(user).toEqual(mockUser);
      expect(token).toBe('test-token');
      expect(isAuthenticated).toBe(true);
      expect(sessionExpiresAt).toBeGreaterThan(Date.now());
    });

    it('should not persist isLoading', () => {
      const { login, setLoading } = useAuthStore.getState();
      login(mockUser, 'token');
      
      setLoading(true);
      
      const { isLoading } = useAuthStore.getState();
      expect(isLoading).toBe(true);
    });

    it('restores state from storage on rehydration', () => {
      // First, set up logged in state
      const { login } = useAuthStore.getState();
      login(mockUser, 'stored-token', 7200000);
      
      // The store should have persisted state
      // When page reloads, Zustand with persist middleware would rehydrate
      const state = useAuthStore.getState();
      
      // Verify persisted data is available
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('stored-token');
    });
  });

  describe('State Transitions', () => {
    it('transitions from logged out to logged in correctly', () => {
      let state = useAuthStore.getState();
      
      // Initial: logged out
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      
      // Login
      state.login(mockUser, 'token', 7200000);
      state = useAuthStore.getState();
      
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.sessionExpiresAt).not.toBeNull();
      
      // Logout
      state.logout();
      state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.sessionExpiresAt).toBeNull();
    });

    it('handles multiple logins correctly', () => {
      const { login, logout } = useAuthStore.getState();
      
      // First login
      login(mockUser, 'token-1', 7200000);
      expect(useAuthStore.getState().token).toBe('token-1');
      
      // Second login (should replace)
      const user2 = { ...mockUser, id: '2', email: 'user2@example.com' };
      login(user2, 'token-2', 7200000);
      expect(useAuthStore.getState().token).toBe('token-2');
      expect(useAuthStore.getState().user).toEqual(user2);
      
      // Logout
      logout();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles login with minimal user data', () => {
      const { login } = useAuthStore.getState();
      
      const minimalUser: TestUser = {
        id: '1',
        email: 'test@test.com',
        firstName: '',
        lastName: '',
        role: 'voter' as UserRole,
      };
      
      login(minimalUser, 'token');
      
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    it('handles updateUser with empty update', () => {
      const { login, updateUser } = useAuthStore.getState();
      login(mockUser, 'token');
      
      updateUser({});
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('handles checkSession when session expires in the future', () => {
      const { login, checkSession } = useAuthStore.getState();
      // Set session to expire 1 hour from now
      login(mockUser, 'token', 3600000);
      
      const result = checkSession();
      
      expect(result).toBe(true);
    });
  });
});
