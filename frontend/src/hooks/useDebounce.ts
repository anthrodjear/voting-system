'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
}

/**
 * Hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = 500
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook for debounced callback
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @param options - Additional options (leading, trailing)
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500,
  options: UseDebounceOptions = {}
): T {
  const { leading = false } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leadingRef = useRef(true);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        callback(...args);
        return;
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        leadingRef.current = true;
      }, delay);
    },
    [callback, delay, leading]
  ) as T;
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Hook for tracking debouncing state
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500)
 * @returns Object with debounced value and isDebouncing state
 */
export function useDebounceWithState<T>(
  value: T,
  delay: number = 500
): {
  debouncedValue: T;
  isDebouncing: boolean;
} {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Set debouncing to true immediately when value changes
    setIsDebouncing(true);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);
  
  return { debouncedValue, isDebouncing };
}

/**
 * Hook for debounced search
 * @param initialValue - Initial search value
 * @param delay - Delay in milliseconds (default: 300)
 * @returns Object with search functions and state
 */
export function useDebouncedSearch<T>(
  initialValue: T,
  delay: number = 300
): {
  searchValue: T;
  debouncedSearch: T;
  isSearching: boolean;
  setSearchValue: (value: T) => void;
  reset: () => void;
} {
  const [searchValue, setSearchValue] = useState<T>(initialValue);
  const { debouncedValue, isDebouncing: isSearching } = useDebounceWithState(searchValue, delay);
  
  const reset = useCallback(() => {
    setSearchValue(initialValue);
  }, [initialValue]);
  
  return {
    searchValue,
    debouncedSearch: debouncedValue,
    isSearching,
    setSearchValue,
    reset
  };
}

export default useDebounce;
