'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  MapIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { UserRole } from '@/types';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  notificationCount?: number;
}

const navItems = [
  { 
    href: '/admin/dashboard', 
    label: 'Dashboard', 
    icon: HomeIcon,
    description: 'Overview & stats'
  },
  { 
    href: '/admin/returning-officers', 
    label: 'Returning Officers', 
    icon: UsersIcon,
    description: 'Manage ROs'
  },
  { 
    href: '/admin/counties', 
    label: 'Counties', 
    icon: MapIcon,
    description: 'Location management'
  },
  { 
    href: '/admin/candidates', 
    label: 'Candidates', 
    icon: UserGroupIcon,
    description: 'Candidate management'
  },
  { 
    href: '/admin/elections', 
    label: 'Elections', 
    icon: ClipboardDocumentListIcon,
    description: 'Election management'
  },
  { 
    href: '/admin/reports', 
    label: 'Reports', 
    icon: DocumentTextIcon,
    description: 'Analytics & reports'
  },
  { 
    href: '/admin/audit-logs', 
    label: 'Audit Logs', 
    icon: ShieldCheckIcon,
    description: 'System audit trail'
  },
  { 
    href: '/admin/settings', 
    label: 'Settings', 
    icon: Cog6ToothIcon,
    description: 'System configuration'
  },
];

export function AdminSidebar({ 
  isOpen = true, 
  onClose,
  notificationCount = 0 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50',
          'bg-gradient-to-b from-admin-600 to-admin-700',
          'transition-all duration-300 ease-in-out',
          'shadow-admin',
          collapsed ? 'w-[72px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">IEBC</h1>
                <p className="text-xs text-admin-200">Admin Portal</p>
              </div>
            )}
          </div>
          
          {/* Mobile Close */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Notification Badge */}
        {!collapsed && notificationCount > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-admin-500/30 rounded-lg">
              <BellIcon className="w-5 h-5 text-admin-200" />
              <span className="text-sm text-admin-100">{notificationCount} pending approvals</span>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'transition-all duration-150 group',
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'text-admin-100 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className={cn(
                  'flex-shrink-0 transition-colors',
                  active ? 'text-white' : 'text-admin-300 group-hover:text-white'
                )}>
                  <item.icon className="w-5 h-5" />
                </span>
                {!collapsed && (
                  <div className="flex-1">
                    <span className="font-medium block">{item.label}</span>
                    <span className="text-xs text-admin-200">{item.description}</span>
                  </div>
                )}
                {!collapsed && active && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'hidden lg:flex absolute bottom-4 items-center gap-2',
            'px-4 py-2 text-admin-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors',
            collapsed ? 'justify-center w-[72px]' : 'left-4'
          )}
        >
          {collapsed ? (
            <ChevronRightIcon className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeftIcon className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
}

export default AdminSidebar;
