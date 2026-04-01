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
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/hooks/use-theme';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

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
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700',
          'transition-all duration-300 z-40',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[280px]',
          'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-voter-50 dark:bg-voter-900/30 flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-voter-500" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">IEBC</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">Voter Portal</p>
              </div>
            )}
          </div>
          <button
            className="ml-auto lg:hidden p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            onClick={() => setMobileOpen(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-160px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'transition-all duration-150',
                  isActive
                    ? 'bg-voter-100 text-voter-700 dark:bg-voter-900/50 dark:text-voter-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-voter-50 dark:hover:bg-neutral-700 hover:text-voter-700 dark:hover:text-neutral-200',
                  sidebarCollapsed ? 'justify-center' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-voter-500 dark:text-voter-400' : 'text-neutral-400 dark:text-neutral-500'}>
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                </span>
                {!sidebarCollapsed && (
                  <span className="flex-1 font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-16 left-0 right-0 px-3 space-y-1">
          <Link
            href="/voter/profile"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700',
              sidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <UserCircleIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Profile</span>}
          </Link>
          <Link
            href="/voter/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700',
              sidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Link>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors hidden lg:block"
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
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'
        )}
      >
        {/* Header */}
        <header className="h-16 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <NotificationDropdown accent="voter" />
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-neutral-200 dark:border-neutral-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">Voter</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-voter-100 dark:bg-voter-900/50 flex items-center justify-center text-voter-600 dark:text-voter-300 font-semibold hover:bg-voter-200 dark:hover:bg-voter-800 transition-colors flex-shrink-0"
                title="Sign out"
              >
                {user?.firstName?.charAt(0) || 'U'}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
