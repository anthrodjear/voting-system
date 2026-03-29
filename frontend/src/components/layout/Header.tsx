'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BellIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge, Button } from '@/components/ui';
import type { User, Notification } from '@/types/index';

interface HeaderProps {
  user: User | null;
  notifications?: Notification[];
  onLogout?: () => void;
  onMenuToggle?: () => void;
  showSearch?: boolean;
}

export function Header({ 
  user, 
  notifications = [], 
  onLogout,
  onMenuToggle,
  showSearch = false
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const userInitials = user 
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : 'U';
  
  const roleLabel = {
    super_admin: 'Super Admin',
    admin: 'Administrator',
    returning_officer: 'Returning Officer',
    sub_ro: 'Sub-RO',
    voter: 'Voter'
  }[user?.role || 'voter'];

  const roleColor = {
    super_admin: 'bg-super-admin-100 text-super-admin-700',
    admin: 'bg-admin-100 text-admin-700',
    returning_officer: 'bg-ro-100 text-ro-700',
    sub_ro: 'bg-ro-100 text-ro-700',
    voter: 'bg-voter-100 text-voter-700'
  }[user?.role || 'voter'];

  return (
    <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-iebc-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-neutral-900 hidden sm:block">IEBC</span>
          </Link>
          
          {/* Search */}
          {showSearch && (
            <div className="hidden md:block relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-neutral-200">
                  <h3 className="font-semibold text-neutral-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-neutral-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer',
                          !notification.read && 'bg-primary-50/50'
                        )}
                      >
                        <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                        <p className="text-xs text-neutral-500 mt-1">{notification.message}</p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-neutral-200 bg-neutral-50">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <Avatar 
                src={user?.avatar}
                initials={userInitials}
                size="sm"
                status="online"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </p>
                <p className="text-xs text-neutral-500">{roleLabel}</p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-neutral-400 hidden md:block" />
            </button>
            
            {/* User Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-neutral-200">
                  <p className="text-sm font-medium text-neutral-900">
                    {user?.email || 'user@example.com'}
                  </p>
                  <Badge className={cn('mt-1', roleColor)}>
                    {roleLabel}
                  </Badge>
                </div>
                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-neutral-200">
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-error hover:bg-error/5 rounded-lg transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
