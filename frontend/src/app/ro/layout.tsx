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
  BellIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/hooks/use-theme';
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
        if (user?.county) setCounty(user.county);
      }
    }
    loadCounty();
  }, [user?.county]);

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

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
        <div className="h-20 flex items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-600 flex-shrink-0 shadow-lg shadow-orange-500/20">
              <ShieldCheckIcon className="w-7 h-7 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white">IEBC</h1>
                <p className="text-xs text-amber-400/70">RO Portal</p>
              </div>
            )}
          </div>
          <button className="ml-auto lg:hidden p-2 text-white/40 hover:text-white" onClick={() => setMobileOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/10 rounded-lg border border-amber-500/20">
              <MapPinIcon className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">{county || 'Nairobi'} County</span>
            </div>
          </div>
        )}

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-180px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20' : 'text-white/50 hover:text-white hover:bg-white/5',
                  sidebarCollapsed ? 'justify-center px-3' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-6 h-6 flex-shrink-0', isActive ? 'text-amber-400' : '')} />
                {!sidebarCollapsed && <span className="flex-1 font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-20 left-0 right-0 px-3 space-y-1">
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

        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute bottom-4 right-4 p-2 text-white/20 hover:text-white/40 hover:bg-white/5 rounded-lg hidden lg:block"
        >
          <ArrowRightIcon className={cn('w-5 h-5 transition-transform', sidebarCollapsed ? 'rotate-180' : '')} />
        </button>
      </aside>

      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]')}>
        <header className="h-20 bg-[#0f0f14]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-white">{navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}</h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={toggleTheme} className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button className="relative p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.firstName || 'RO'} {user?.lastName || 'Officer'}</p>
                <p className="text-xs text-white/30">Returning Officer</p>
              </div>
              <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-semibold">
                {user?.firstName?.charAt(0) || 'R'}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}