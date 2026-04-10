'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/hooks/use-theme';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import roService from '@/services/ro';

interface ROLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/ro/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/ro/voters', label: 'Voters', icon: UsersIcon },
  { href: '/ro/candidates', label: 'Candidates', icon: UserGroupIcon },
  { href: '/ro/geographic', label: 'Counties & Wards', icon: ClipboardDocumentListIcon },
  { href: '/ro/proposals', label: 'My Proposals', icon: MapPinIcon },
];

export default function ROLayout({ children }: ROLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  // Load RO's assigned county from API
  const [county, setCounty] = useState<string>('');

  useEffect(() => {
    async function loadCounty() {
      try {
        const stats = await roService.getDashboardStats();
        if (stats.assignedCounty?.name) {
          setCounty(stats.assignedCounty.name);
        } else if (user?.county) {
          setCounty(user.county);
        }
      } catch {
        // Fall back to user data
        if (user?.county) {
          setCounty(user.county);
        }
      }
    }
    loadCounty();
  }, [user?.county]);

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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-ro-50 dark:bg-ro-900/30 flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-ro-500" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">IEBC</h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">RO Portal</p>
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

        {/* County Badge */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center gap-2 px-3 py-2 bg-ro-50 dark:bg-ro-900/30 rounded-lg">
              <MapPinIcon className="w-4 h-4 text-ro-500 flex-shrink-0" />
              <span className="text-sm font-medium text-ro-700 dark:text-ro-300 truncate">{county} County</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
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
                    ? 'bg-ro-100 text-ro-700 dark:bg-ro-900/50 dark:text-ro-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-ro-50 dark:hover:bg-neutral-700 hover:text-ro-700 dark:hover:text-neutral-200',
                  sidebarCollapsed ? 'justify-center' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-ro-500 dark:text-ro-400' : 'text-neutral-400 dark:text-neutral-500'}>
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
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg w-full',
              'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700',
              sidebarCollapsed ? 'justify-center' : ''
            )}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors hidden lg:block"
        >
          <svg
            className={cn('w-5 h-5 transition-transform', sidebarCollapsed ? 'rotate-180' : '')}
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
            <NotificationDropdown accent="ro" />
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-neutral-200 dark:border-neutral-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.firstName || 'RO'} {user?.lastName || 'Officer'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">Returning Officer</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-ro-100 dark:bg-ro-900/50 flex items-center justify-center text-ro-600 dark:text-ro-300 font-semibold hover:bg-ro-200 dark:hover:bg-ro-800 transition-colors flex-shrink-0"
                title="Sign out"
              >
                {user?.firstName?.charAt(0) || 'R'}
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
