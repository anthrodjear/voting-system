'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  UsersIcon,
  MapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ClockIcon,
  BellIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/hooks/use-theme';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/returning-officers', label: 'Returning Officers', icon: UsersIcon },
  { href: '/admin/counties', label: 'Counties & Wards', icon: MapIcon },
  { href: '/admin/candidates', label: 'Candidates', icon: UserGroupIcon },
  { href: '/admin/elections', label: 'Elections', icon: ClipboardDocumentListIcon },
  { href: '/admin/pending-changes', label: 'Pending Changes', icon: ClockIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#0f0f14] border-r border-white/5',
          'transition-all duration-300 z-50',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]',
          'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600 flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <ShieldCheckIcon className="w-7 h-7 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white">IEBC</h1>
                <p className="text-xs text-emerald-400/70">Admin Portal</p>
              </div>
            )}
          </div>
          {/* Close button on mobile */}
          <button
            className="ml-auto lg:hidden p-2 text-white/40 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
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
                  'flex items-center gap-3 px-4 py-3 rounded-xl',
                  'transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5',
                  sidebarCollapsed ? 'justify-center px-3' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-6 h-6 flex-shrink-0', isActive ? 'text-emerald-400' : '')} />
                {!sidebarCollapsed && (
                  <span className="flex-1 font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-20 left-0 right-0 px-3 space-y-1">
          <Link
            href="/admin/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl',
              'text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-3' : ''
            )}
          >
            <Cog6ToothIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </Link>
          
          <button 
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full',
              'text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-3' : ''
            )}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 p-2 text-white/20 hover:text-white/40 hover:bg-white/5 rounded-lg transition-colors hidden lg:block"
        >
          <ArrowRightIcon className={cn('w-5 h-5 transition-transform', sidebarCollapsed ? 'rotate-180' : '')} />
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
        )}
      >
        {/* Header */}
        <header className="h-20 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-white">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs text-white/30">Administrator</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors"
                title="Sign out"
              >
                {user?.firstName?.charAt(0) || 'A'}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}