'use client';

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prev: T) => T);

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  defaultValue?: T;
  onError?: (error: Error) => void;
}

/**
 * Default serializer
 */
function defaultSerializer<T>(value: T): string {
  return JSON.stringify(value);
}

/**
 * Default deserializer
 */
function defaultDeserializer<T>(value: string): T {
  return JSON.parse(value);
}

/**
 * Hook for managing localStorage
 * @param key - The localStorage key
 * @param initialValue - Initial value if nothing stored
 * @param options - Additional options
 * @returns Tuple of [value, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError
  } = options;
  
  // Get initial value
  const getInitialValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserializer(item);
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);
  
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize from localStorage on mount
  useEffect(() => {
    setIsInitialized(true);
    
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserializer(item));
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  }, [key, deserializer, onError]);
  
  /**
   * Set value in localStorage
   */
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Get value (either direct or from function)
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save to state
        setStoredValue(valueToStore);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error);
        }
      }
    },
    [key, serializer, storedValue, onError]
  );
  
  /**
   * Remove value from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  }, [key, initialValue, onError]);
  
  return [isInitialized ? storedValue : initialValue, setValue, removeValue];
}

/**
 * Hook for managing sessionStorage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError
  } = options;
  
  const getInitialValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserializer(item);
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);
  
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    setIsInitialized(true);
    
    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        setStoredValue(deserializer(item));
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  }, [key, deserializer, onError]);
  
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error);
        }
      }
    },
    [key, serializer, storedValue, onError]
  );
  
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      if (error instanceof Error) {
        onError?.(error);
      }
    }
  }, [key, initialValue, onError]);
  
  return [isInitialized ? storedValue : initialValue, setValue, removeValue];
}

/**
 * Hook for managing cookie storage
 */
export function useCookie<T>(
  key: string,
  initialValue: T,
  options: {
    days?: number;
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
  } = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const { days = 7, serializer = defaultSerializer, deserializer = defaultDeserializer } = options;
  
  const getCookieValue = useCallback((): T => {
    if (typeof document === 'undefined') {
      return initialValue;
    }
    
    const name = `${key}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return deserializer(cookie.substring(name.length, cookie.length));
      }
    }
    
    return initialValue;
  }, [key, initialValue, deserializer]);
  
  const [storedValue, setStoredValue] = useState<T>(getCookieValue);
  
  const setValue = useCallback(
    (value: SetValue<T>) => {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof document !== 'undefined') {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${key}=${serializer(valueToStore)};${expires};path=/`;
      }
    },
    [key, days, serializer, storedValue]
  );
  
  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    
    if (typeof document !== 'undefined') {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
