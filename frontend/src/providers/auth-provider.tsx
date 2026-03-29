'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, usePathname } from 'next/navigation';

// Map user roles to route groups
const ROLE_ROUTES = {
  super_admin: '/admin',
  admin: '/admin',
  returning_officer: '/ro',
  voter: '/voter',
} as const;

interface AuthProviderProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register'];

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }

    // If authenticated and trying to access auth routes
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      if (user?.role) {
        const redirectPath = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES];
        router.push(`${redirectPath}/dashboard`);
      } else {
        router.push('/voter/dashboard');
      }
    }

    // If authenticated, verify they're on the right route for their role
    if (isAuthenticated && user?.role && !isPublicRoute) {
      const expectedPrefix = ROLE_ROUTES[user.role as keyof typeof ROLE_ROUTES];
      const currentPrefix = '/' + pathname.split('/')[1];
      
      // Only redirect if they're on a route that doesn't match their role
      if (expectedPrefix && currentPrefix !== expectedPrefix && pathname !== '/') {
        // Allow access to shared routes
        const sharedRoutes = ['/vote'];
        const isSharedRoute = sharedRoutes.some(route => pathname.startsWith(route));
        
        if (!isSharedRoute) {
          // Don't redirect immediately, let them stay where they are for now
        }
      }
    }
  }, [mounted, isAuthenticated, isLoading, pathname, router, user]);

  // Show loading state while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
