'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  MapIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';

interface ROSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  countyName?: string;
  pendingCount?: number;
}

const navItems = [
  { 
    href: '/ro/dashboard', 
    label: 'Dashboard', 
    icon: HomeIcon,
    description: 'Overview & stats'
  },
  { 
    href: '/ro/voters', 
    label: 'Voters', 
    icon: UsersIcon,
    description: 'Voter management'
  },
  { 
    href: '/ro/candidates', 
    label: 'Candidates', 
    icon: UserGroupIcon,
    description: 'Candidate list'
  },
  { 
    href: '/ro/sub-ro', 
    label: 'Sub-ROs', 
    icon: MapPinIcon,
    description: 'Sub-Returning Officers'
  },
  { 
    href: '/ro/elections', 
    label: 'Elections', 
    icon: ClipboardDocumentListIcon,
    description: 'Election management'
  },
  { 
    href: '/ro/reports', 
    label: 'Reports', 
    icon: DocumentTextIcon,
    description: 'Analytics & reports'
  },
  { 
    href: '/ro/settings', 
    label: 'Settings', 
    icon: Cog6ToothIcon,
    description: 'Configuration'
  },
];

export function ROSidebar({ 
  isOpen = true, 
  onClose,
  countyName = 'County',
  pendingCount = 0
}: ROSidebarProps) {
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
          'bg-gradient-to-b from-ro-600 to-ro-700',
          'transition-all duration-300 ease-in-out',
          'shadow-ro',
          collapsed ? 'w-[72px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">IEBC</h1>
                <p className="text-xs text-ro-200">RO Portal</p>
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
        
        {/* County Info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2 px-3 py-2 bg-ro-500/30 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-ro-200" />
              <div>
                <span className="text-sm font-medium text-white block">{countyName}</span>
                <span className="text-xs text-ro-200">Returning Officer</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Pending Tasks */}
        {!collapsed && pendingCount > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between px-3 py-2 bg-warning/20 rounded-lg border border-warning/30">
              <span className="text-sm text-warning-light font-medium">{pendingCount} pending tasks</span>
              <Badge variant="warning" size="sm">{pendingCount}</Badge>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-12rem)]">
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
                    : 'text-ro-100 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className={cn(
                  'flex-shrink-0 transition-colors',
                  active ? 'text-white' : 'text-ro-300 group-hover:text-white'
                )}>
                  <item.icon className="w-5 h-5" />
                </span>
                {!collapsed && (
                  <div className="flex-1">
                    <span className="font-medium block">{item.label}</span>
                    <span className="text-xs text-ro-200">{item.description}</span>
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
            'px-4 py-2 text-ro-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors',
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

export default ROSidebar;
