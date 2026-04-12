'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentChartBarIcon,
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

interface ObserverLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/observer', label: 'Dashboard', icon: HomeIcon },
  { href: '/observer/candidates', label: 'Candidates', icon: UserGroupIcon },
  { href: '/observer/blockchain', label: 'Blockchain', icon: CubeIcon },
  { href: '/observer/reports', label: 'Reports', icon: DocumentChartBarIcon },
];

export default function ObserverLayout({ children }: ObserverLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0 shadow-lg shadow-cyan-500/20">
              <DocumentChartBarIcon className="w-7 h-7 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white">IEBC</h1>
                <p className="text-xs text-cyan-400/70">Live Observer</p>
              </div>
            )}
          </div>
          <button className="ml-auto lg:hidden p-2 text-white/40 hover:text-white" onClick={() => setMobileOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-160px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                  isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/20' : 'text-white/50 hover:text-white hover:bg-white/5',
                  sidebarCollapsed ? 'justify-center px-3' : ''
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-6 h-6 flex-shrink-0', isActive ? 'text-cyan-400' : '')} />
                {!sidebarCollapsed && <span className="flex-1 font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-20 left-0 right-0 px-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-3' : ''
            )}
          >
            <ArrowLeftIcon className="w-6 h-6 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Exit Observer</span>}
          </Link>
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
            <h2 className="text-xl font-semibold text-white">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'Live Election Observer'}
            </h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={toggleTheme} className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg">
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">Public Observer</p>
                <p className="text-xs text-white/30">No login required</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}