'use client';

import { useEffect, useState, useCallback } from 'react';

type MediaQuery = string;

interface Breakpoint {
  name: string;
  value: number;
}

// Standard Tailwind CSS breakpoints (in pixels)
const BREAKPOINTS: Breakpoint[] = [
  { name: 'xs', value: 0 },
  { name: 'sm', value: 640 },
  { name: 'md', value: 768 },
  { name: 'lg', value: 1024 },
  { name: 'xl', value: 1280 },
  { name: '2xl', value: 1536 },
  { name: '3xl', value: 1920 },
];

/**
 * Hook for responsive media queries
 * @param query - Media query string
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: MediaQuery): boolean {
  const [matches, setMatches] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);
  
  // Return false during SSR to avoid hydration mismatch
  return isMounted ? matches : false;
}

/**
 * Hook for checking if viewport is mobile
 * @param breakpoint - Breakpoint value (default: 768 for md)
 * @returns Boolean indicating if viewport is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * Hook for checking if viewport is tablet
 * @param minBreakpoint - Minimum breakpoint (default: 768 for md)
 * @param maxBreakpoint - Maximum breakpoint (default: 1024 for lg)
 * @returns Boolean indicating if viewport is tablet
 */
export function useIsTablet(
  minBreakpoint: number = 768,
  maxBreakpoint: number = 1024
): boolean {
  return useMediaQuery(
    `(min-width: ${minBreakpoint}px) and (max-width: ${maxBreakpoint - 1}px)`
  );
}

/**
 * Hook for checking if viewport is desktop
 * @param breakpoint - Breakpoint value (default: 1024 for lg)
 * @returns Boolean indicating if viewport is desktop
 */
export function useIsDesktop(breakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}

/**
 * Hook for getting current breakpoint
 * @returns Current breakpoint name
 */
export function useBreakpoint(): string {
  const [breakpoint, setBreakpoint] = useState<string>('xs');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const getBreakpoint = () => {
      const width = window.innerWidth;
      
      for (let i = BREAKPOINTS.length - 1; i >= 0; i--) {
        if (width >= BREAKPOINTS[i].value) {
          return BREAKPOINTS[i].name;
        }
      }
      
      return 'xs';
    };
    
    setBreakpoint(getBreakpoint());
    
    const handler = () => {
      setBreakpoint(getBreakpoint());
    };
    
    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return isMounted ? breakpoint : 'xs';
}

/**
 * Hook for checking if viewport is in dark mode
 * @returns Boolean indicating if dark mode is active
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Hook for checking if user prefers reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook for checking if device supports hover
 * @returns Boolean indicating if device supports hover
 */
export function usePrefersHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Hook for checking orientation
 * @returns 'portrait' | 'landscape'
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    const getOrientation = () => {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    };
    
    setOrientation(getOrientation());
    
    const handler = () => {
      setOrientation(getOrientation());
    };
    
    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return isMounted ? orientation : 'portrait';
}

/**
 * Hook for viewport dimensions
 * @returns Object with width and height
 */
export function useViewportSize(): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Set initial size
    setSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    const handler = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handler);
    
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  
  return isMounted ? size : { width: 0, height: 0 };
}

/**
 * Combined hook for common media queries
 * @returns Object with all media query states
 */
export function useMediaQueries() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const breakpoint = useBreakpoint();
  const prefersDarkMode = usePrefersDarkMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersHover = usePrefersHover();
  const orientation = useOrientation();
  const viewportSize = useViewportSize();
  
  return {
    // Breakpoint states
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    
    // Preference states
    prefersDarkMode,
    prefersReducedMotion,
    prefersHover,
    
    // Orientation
    orientation,
    
    // Viewport size
    viewportSize,
    
    // Helper
    isBelow: (breakpointName: string) => {
      const bp = BREAKPOINTS.find(b => b.name === breakpointName);
      return bp ? viewportSize.width < bp.value : false;
    },
    isAbove: (breakpointName: string) => {
      const bp = BREAKPOINTS.find(b => b.name === breakpointName);
      return bp ? viewportSize.width >= bp.value : false;
    }
  };
}

export default useMediaQuery;
