/**
 * IEBC Blockchain Voting System - Layout Components
 * Professional, trustworthy, secure, democratic
 */

import React, { useState } from 'react';
import Link from 'next/link';

// ============================================
// SIDEBAR NAVIGATION
// ============================================

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  active?: boolean;
}

interface SidebarProps {
  items: NavItem[];
  role: 'super-admin' | 'admin' | 'returning-officer' | 'voter';
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  role,
  collapsed = false,
  onCollapse,
}) => {
  const roleColors = {
    'super-admin': {
      bg: 'bg-super-admin-50',
      active: 'bg-super-admin-100 text-super-admin-700',
      hover: 'hover:bg-super-admin-50 hover:text-super-admin-700',
      icon: 'text-super-admin-500',
    },
    admin: {
      bg: 'bg-admin-50',
      active: 'bg-admin-100 text-admin-700',
      hover: 'hover:bg-admin-50 hover:text-admin-700',
      icon: 'text-admin-500',
    },
    'returning-officer': {
      bg: 'bg-ro-50',
      active: 'bg-ro-100 text-ro-700',
      hover: 'hover:bg-ro-50 hover:text-ro-700',
      icon: 'text-ro-500',
    },
    voter: {
      bg: 'bg-voter-50',
      active: 'bg-voter-100 text-voter-700',
      hover: 'hover:bg-voter-50 hover:text-voter-700',
      icon: 'text-voter-500',
    },
  };

  const colors = roleColors[role];

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-white border-r border-neutral-200
        transition-all duration-300 z-40
        ${collapsed ? 'w-[72px]' : 'w-[280px]'}
      `}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <svg className={`w-6 h-6 ${colors.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-neutral-900">IEBC</h1>
              <p className="text-xs text-neutral-500">Blockchain Voting</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-all duration-150
              ${item.active 
                ? colors.active 
                : `text-neutral-600 ${colors.hover}`
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            title={collapsed ? item.label : undefined}
          >
            <span className={item.active ? colors.icon : 'text-neutral-400'}>
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-error text-white rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Collapse Button */}
      <button
        onClick={() => onCollapse?.(!collapsed)}
        className="absolute bottom-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <svg
          className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
};

// ============================================
// HEADER
// ============================================

interface HeaderProps {
  title?: string;
  role: 'super-admin' | 'admin' | 'returning-officer' | 'voter';
  onMenuClick?: () => void;
  notifications?: number;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  role,
  notifications = 0,
  user,
}) => {
  const roleLabels = {
    'super-admin': 'Super Admin',
    admin: 'Administrator',
    'returning-officer': 'Returning Officer',
    voter: 'Voter',
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        {title && <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {notifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error text-white text-xs font-bold flex items-center justify-center rounded-full">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.role}</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-semibold">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================
// MAIN LAYOUT
// ============================================

interface LayoutProps {
  children: React.ReactNode;
  role: 'super-admin' | 'admin' | 'returning-officer' | 'voter';
  sidebarItems?: NavItem[];
  title?: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  notifications?: number;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  role,
  sidebarItems = [],
  title,
  user,
  notifications = 0,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar
        items={sidebarItems}
        role={role}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      
      <div
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[280px]'}
        `}
      >
        <Header
          title={title}
          role={role}
          notifications={notifications}
          user={user}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// ============================================
// PAGE LAYOUT VARIANTS
// ============================================

// Voter Layout (Simpler, centered)
export const VoterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-neutral-50">
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-voter-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-voter-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-neutral-900">IEBC</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-neutral-500 hover:text-neutral-700">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </header>
    <main className="max-w-4xl mx-auto px-4 py-8">
      {children}
    </main>
  </div>
);

// Auth Layout (Centered, minimal)
export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-iebc-primary rounded-2xl mb-4">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">IEBC Voting System</h1>
        <p className="text-neutral-500 mt-1">Secure Blockchain-Powered Elections</p>
      </div>
      {children}
    </div>
  </div>
);

export default {
  Sidebar,
  Header,
  Layout,
  VoterLayout,
  AuthLayout,
};
