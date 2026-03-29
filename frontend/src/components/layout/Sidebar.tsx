'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Badge, Button } from '@/components/ui';
import type { UserRole } from '@/types';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  children?: SidebarItem[];
  requiredRoles?: UserRole[];
}

interface SidebarProps {
  items: SidebarItem[];
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ 
  items, 
  isOpen, 
  onClose, 
  role = 'admin',
  collapsed = false,
  onCollapse
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const roleStyles = {
    super_admin: {
      bg: 'bg-super-admin-600',
      hover: 'hover:bg-super-admin-700',
      active: 'bg-super-admin-700',
      text: 'text-super-admin-100',
      icon: 'text-super-admin-300',
      border: 'border-super-admin-500'
    },
    admin: {
      bg: 'bg-admin-600',
      hover: 'hover:bg-admin-700',
      active: 'bg-admin-700',
      text: 'text-admin-100',
      icon: 'text-admin-300',
      border: 'border-admin-500'
    },
    returning_officer: {
      bg: 'bg-ro-600',
      hover: 'hover:bg-ro-700',
      active: 'bg-ro-700',
      text: 'text-ro-100',
      icon: 'text-ro-300',
      border: 'border-ro-500'
    },
    sub_ro: {
      bg: 'bg-ro-600',
      hover: 'hover:bg-ro-700',
      active: 'bg-ro-700',
      text: 'text-ro-100',
      icon: 'text-ro-300',
      border: 'border-ro-500'
    },
    voter: {
      bg: 'bg-voter-600',
      hover: 'hover:bg-voter-700',
      active: 'bg-voter-700',
      text: 'text-voter-100',
      icon: 'text-voter-300',
      border: 'border-voter-500'
    }
  };
  
  const styles = roleStyles[role] || roleStyles.admin;
  
  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };
  
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };
  
  const canAccess = (requiredRoles?: UserRole[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(role);
  };
  
  const renderItem = (item: SidebarItem, depth = 0) => {
    if (!canAccess(item.requiredRoles)) return null;
    
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const itemActive = isActive(item.href);
    
    return (
      <div key={item.href}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.href)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-all duration-150',
              itemActive 
                ? styles.active + ' ' + styles.text
                : 'text-neutral-300 hover:bg-white/10',
              depth > 0 && 'ml-4'
            )}
          >
            <item.icon className={cn('w-5 h-5 flex-shrink-0', itemActive ? styles.icon : 'text-neutral-400')} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronDownIcon className={cn(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-180'
                )} />
              </>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-all duration-150',
              itemActive 
                ? styles.active + ' ' + styles.text
                : 'text-neutral-300 hover:bg-white/10',
              collapsed && 'justify-center',
              depth > 0 && 'ml-4'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className={cn('w-5 h-5 flex-shrink-0', itemActive ? styles.icon : 'text-neutral-400')} />
            {!collapsed && (
              <>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge && (
                  <Badge 
                    variant={itemActive ? 'secondary' : 'error'}
                    size="sm"
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
          </Link>
        )}
        
        {/* Render children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
          'transition-all duration-300 ease-in-out',
          styles.bg,
          collapsed ? 'w-[72px]' : 'w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">IEBC</h1>
                <p className="text-xs text-white/60">Voting System</p>
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
        
        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {items.map(item => renderItem(item))}
        </nav>
        
        {/* Collapse Button (Desktop) */}
        {!collapsed && (
          <button
            onClick={onCollapse}
            className="hidden lg:flex absolute bottom-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Expand Button (Collapsed State) */}
        {collapsed && (
          <button
            onClick={onCollapse}
            className="hidden lg:flex absolute bottom-4 left-1/2 -translate-x-1/2 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
