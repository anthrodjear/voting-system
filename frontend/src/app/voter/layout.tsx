'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

interface VoterLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/voter/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/voter/register', label: 'Register', icon: ClipboardDocumentCheckIcon },
  { href: '/voter/vote', label: 'Vote', icon: ClipboardDocumentListIcon },
];

export default function VoterLayout({ children }: VoterLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white border-r border-neutral-200',
          'transition-all duration-300 z-40',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-voter-50">
              <ShieldCheckIcon className="w-6 h-6 text-voter-500" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-neutral-900">IEBC</h1>
                <p className="text-xs text-neutral-500">Voter Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-voter-100 text-voter-700'
                    : 'text-neutral-600 hover:bg-voter-50 hover:text-voter-700',
                  sidebarCollapsed ? 'justify-center' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-voter-500' : 'text-neutral-400'}>
                  <item.icon className="w-6 h-6" />
                </span>
                {!sidebarCollapsed && (
                  <span className="flex-1 font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-16 left-0 right-0 px-3 space-y-1">
          <Link
            href="/voter/profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-neutral-600 hover:bg-neutral-50',
              sidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <UserCircleIcon className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-medium">Profile</span>}
          </Link>
          <Link
            href="/voter/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-neutral-600 hover:bg-neutral-50',
              sidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <Cog6ToothIcon className="w-6 h-6" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]'
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-neutral-900">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
              <BellIcon className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-xs font-bold flex items-center justify-center rounded-full">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500">Voter</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-voter-100 flex items-center justify-center text-voter-600 font-semibold hover:bg-voter-200 transition-colors"
                title="Sign out"
              >
                {user?.firstName?.charAt(0) || 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
