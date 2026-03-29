/**
 * IEBC Blockchain Voting System - Custom Hooks
 * 
 * A comprehensive set of custom hooks for the voting system.
 * 
 * @version 1.0.0
 * @author IEBC Development Team
 */

// Authentication Hooks
export { useAuth, default as default } from './useAuth';

// Registration Hooks
export { useRegistration } from './useRegistration';

// Voting Hooks
export { useVoting } from './useVoting';

// Election Hooks
export { useElectionCountdown } from './useElectionCountdown';

// Utility Hooks
export { 
  useDebounce, 
  useDebouncedCallback, 
  useDebounceWithState, 
  useDebouncedSearch 
} from './useDebounce';

export { 
  useLocalStorage, 
  useSessionStorage, 
  useCookie 
} from './useLocalStorage';

export { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useBreakpoint,
  usePrefersDarkMode,
  usePrefersReducedMotion,
  usePrefersHover,
  useOrientation,
  useViewportSize,
  useMediaQueries
} from './useMediaQuery';

// ============================================
// Hook Categories
// ============================================

/**
 * Authentication Hooks
 * - useAuth: Authentication state and actions
 * 
 * Registration Hooks
 * - useRegistration: Voter registration flow management
 * 
 * Voting Hooks
 * - useVoting: Voting process management
 * 
 * Election Hooks
 * - useElectionCountdown: Election countdown timer
 * 
 * Utility Hooks
 * - useDebounce: Debounce values and callbacks
 * - useLocalStorage: localStorage management
 * - useMediaQuery: Responsive media queries
 */

// ============================================
// Usage Examples
// ============================================

/**
 * // useAuth
 * const { user, isAuthenticated, login, logout, checkPermission } = useAuth();
 * 
 * // useRegistration
 * const { step, nextStep, prevStep, submitRegistration } = useRegistration();
 * 
 * // useVoting
 * const { joinBatch, submitVote, canVote } = useVoting();
 * 
 * // useElectionCountdown
 * const { days, hours, minutes, seconds, isExpired } = useElectionCountdown({ electionId });
 * 
 * // useDebounce
 * const debouncedValue = useDebounce(searchValue, 300);
 * 
 * // useLocalStorage
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 * // useMediaQuery
 * const isMobile = useIsMobile();
 * const { isMobile, isTablet, isDesktop, breakpoint } = useMediaQueries();
 */

// ============================================
// Version
// ============================================

export const VERSION = '1.0.0';
