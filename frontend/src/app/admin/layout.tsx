'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
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
  BellIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useNotifications } from '@/hooks/useNotifications';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/admin/returning-officers', label: 'Returning Officers', icon: UsersIcon },
  { href: '/admin/counties', label: 'Counties', icon: MapIcon },
  { href: '/admin/candidates', label: 'Candidates', icon: UserGroupIcon },
  { href: '/admin/elections', label: 'Elections', icon: ClipboardDocumentListIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { notifications, unreadCount, isOpen, toggleOpen, setOpen, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpen]);

  const getNotificationIcon = (type: string, icon?: string) => {
    if (icon === 'user-plus') return <UserPlusIcon className="w-5 h-5" />;
    if (icon === 'chart') return <ChartBarIcon className="w-5 h-5" />;
    if (icon === 'alert') return <ExclamationTriangleIcon className="w-5 h-5" />;
    if (icon === 'calendar') return <CalendarDaysIcon className="w-5 h-5" />;
    if (icon === 'check') return <CheckIcon className="w-5 h-5" />;
    switch (type) {
      case 'success': return <CheckIcon className="w-5 h-5" />;
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'error': return <XMarkIcon className="w-5 h-5" />;
      default: return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-light text-success';
      case 'warning': return 'bg-warning-light text-warning-dark';
      case 'error': return 'bg-error-light text-error-dark';
      default: return 'bg-primary-50 text-primary-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-admin-50">
              <ShieldCheckIcon className="w-6 h-6 text-admin-500" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-neutral-900">IEBC</h1>
                <p className="text-xs text-neutral-500">Admin Portal</p>
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
                    ? 'bg-admin-100 text-admin-700'
                    : 'text-neutral-600 hover:bg-admin-50 hover:text-admin-700',
                  sidebarCollapsed ? 'justify-center' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-admin-500' : 'text-neutral-400'}>
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
            href="/admin/settings"
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
            {/* Notifications Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleOpen}
                className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-50">
                  {/* Header */}
                  <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-12 text-center">
                        <BellIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                        <p className="text-neutral-500 text-sm">No notifications yet</p>
                        <p className="text-neutral-400 text-xs mt-1">
                          You&apos;ll see updates about RO applications, system alerts, and more here.
                        </p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer',
                            !notification.read && 'bg-primary-50/50'
                          )}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                                getNotificationColor(notification.type)
                              )}
                            >
                              {getNotificationIcon(notification.type, notification.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    'text-sm truncate',
                                    notification.read
                                      ? 'text-neutral-700'
                                      : 'font-semibold text-neutral-900'
                                  )}
                                >
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-neutral-400 mt-1">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 rounded"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-center">
                      <span className="text-xs text-neutral-500">
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''} &middot;{' '}
                        {unreadCount} unread
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs text-neutral-500">Administrator</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-admin-100 flex items-center justify-center text-admin-600 font-semibold hover:bg-admin-200 transition-colors"
                title="Sign out"
              >
                {user?.firstName?.charAt(0) || 'A'}
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
