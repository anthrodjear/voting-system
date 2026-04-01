'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  UserPlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
  /** Accent color theme matching the portal */
  accent?: 'admin' | 'voter' | 'ro';
}

export default function NotificationDropdown({ accent = 'admin' }: NotificationDropdownProps) {
  const { notifications, unreadCount, isOpen, toggleOpen, setOpen, markAsRead, markAllAsRead } =
    useNotifications();
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

  const getAccentClasses = () => {
    switch (accent) {
      case 'voter':
        return {
          unread: 'bg-voter-500',
          unreadBg: 'bg-voter-50/50',
          dot: 'bg-voter-500',
          link: 'text-voter-600 hover:text-voter-700',
        };
      case 'ro':
        return {
          unread: 'bg-ro-500',
          unreadBg: 'bg-ro-50/50',
          dot: 'bg-ro-500',
          link: 'text-ro-600 hover:text-ro-700',
        };
      default:
        return {
          unread: 'bg-error',
          unreadBg: 'bg-primary-50/50',
          dot: 'bg-primary-500',
          link: 'text-primary-600 hover:text-primary-700',
        };
    }
  };

  const colors = getAccentClasses();

  const getNotificationIcon = (type: string, icon?: string) => {
    if (icon === 'user-plus') return <UserPlusIcon className="w-5 h-5" />;
    if (icon === 'chart') return <ChartBarIcon className="w-5 h-5" />;
    if (icon === 'alert') return <ExclamationTriangleIcon className="w-5 h-5" />;
    if (icon === 'calendar') return <CalendarDaysIcon className="w-5 h-5" />;
    if (icon === 'clipboard') return <ClipboardDocumentCheckIcon className="w-5 h-5" />;
    if (icon === 'shield') return <ShieldCheckIcon className="w-5 h-5" />;
    if (icon === 'check') return <CheckIcon className="w-5 h-5" />;
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'error':
        return <XMarkIcon className="w-5 h-5" />;
      default:
        return <BellIcon className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-light text-success';
      case 'warning':
        return 'bg-warning-light text-warning-dark';
      case 'error':
        return 'bg-error-light text-error-dark';
      default:
        return 'bg-primary-50 text-primary-600';
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleOpen}
        className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-xs font-bold flex items-center justify-center rounded-full animate-pulse',
              colors.unread
            )}
          >
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
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className={cn('text-xs font-medium', colors.link)}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <BellIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No notifications yet</p>
                <p className="text-neutral-400 text-xs mt-1">
                  You&apos;ll see updates about your account, elections, and system alerts here.
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer',
                    !notification.read && colors.unreadBg
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
                            notification.read ? 'text-neutral-700' : 'font-semibold text-neutral-900'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span
                            className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)}
                          />
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
  );
}
