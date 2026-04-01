'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  ClipboardDocumentCheckIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Button, Badge } from '@/components/ui';
import type { User, RegistrationStatus } from '@/types';

interface VoterLayoutProps {
  children: React.ReactNode;
  user?: User | null;
  registrationStatus?: RegistrationStatus;
  onLogout?: () => void;
}

const navItems = [
  { 
    href: '/voter/dashboard', 
    label: 'Dashboard', 
    icon: HomeIcon 
  },
  { 
    href: '/voter/register', 
    label: 'Register to Vote', 
    icon: ClipboardDocumentCheckIcon,
    requiresAuth: true
  },
  { 
    href: '/voter/vote', 
    label: 'Cast Vote', 
    icon: CheckCircleIcon,
    requiresAuth: true
  },
  { 
    href: '/voter/profile', 
    label: 'My Profile', 
    icon: UserCircleIcon,
    requiresAuth: true
  },
  { 
    href: '/voter/settings', 
    label: 'Settings', 
    icon: Cog6ToothIcon,
    requiresAuth: true
  },
];

export function VoterLayout({ 
  children, 
  user,
  registrationStatus,
  onLogout 
}: VoterLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    router.push('/login');
  };
  
  const statusColors: Record<RegistrationStatus, string> = {
    not_registered: 'bg-neutral-100 text-neutral-700',
    pending: 'bg-warning/20 text-warning-dark',
    verified: 'bg-success/20 text-success-dark',
    rejected: 'bg-error/20 text-error-dark'
  };
  
  const statusLabels: Record<RegistrationStatus, string> = {
    not_registered: 'Not Registered',
    pending: 'Pending Verification',
    verified: 'Verified Voter',
    rejected: 'Registration Rejected'
  };
  
  const userInitials = user 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : 'V';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/voter/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-iebc-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-neutral-900">IEBC</span>
              </Link>
              
              {/* Status Badge */}
              {user && registrationStatus && (
                <Badge className={statusColors[registrationStatus]}>
                  {statusLabels[registrationStatus]}
                </Badge>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active 
                        ? 'bg-voter-100 text-voter-700' 
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            
            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Avatar 
                      initials={userInitials}
                      size="sm"
                    />
                    <div className="text-right">
                      <p className="text-sm font-medium text-neutral-900">
                        {user.firstName}
                      </p>
                      <p className="text-xs text-neutral-500">Voter</p>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-neutral-600 hover:text-error"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                if (item.requiresAuth && !user) return null;
                
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active 
                        ? 'bg-voter-100 text-voter-700' 
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              {!user && (
                <div className="pt-2 border-t border-neutral-200 space-y-2">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth>
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-neutral-500">
            <p>&copy; 2024 IEBC. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-neutral-700">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-neutral-700">Terms of Service</Link>
              <Link href="/help" className="hover:text-neutral-700">Help Center</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VoterLayout;
