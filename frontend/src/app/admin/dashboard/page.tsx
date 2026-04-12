'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  UsersIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  TrashIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';
import { formatNumber, formatDate } from '@/lib/utils';
import adminService from '@/services/admin';

const quickLinks = [
  { label: 'Manage Returning Officers', href: '/admin/returning-officers', icon: UsersIcon, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20', text: 'text-blue-400' },
  { label: 'Manage Counties', href: '/admin/counties', icon: MapPinIcon, color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20', text: 'text-purple-400' },
  { label: 'Manage Candidates', href: '/admin/candidates', icon: UserPlusIcon, color: 'from-pink-500/20 to-pink-600/10 border-pink-500/20', text: 'text-pink-400' },
  { label: 'Manage Elections', href: '/admin/elections', icon: ClipboardDocumentCheckIcon, color: 'from-orange-500/20 to-orange-600/10 border-orange-500/20', text: 'text-orange-400' },
];

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('approved') || lower.includes('created') || lower.includes('verified') || lower.includes('published')) {
    return { icon: CheckCircleIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
  }
  if (lower.includes('rejected') || lower.includes('deleted') || lower.includes('failed') || lower.includes('error')) {
    return { icon: ExclamationCircleIcon, color: 'text-red-400', bg: 'bg-red-500/20' };
  }
  return { icon: ClockIcon, color: 'text-white/40', bg: 'bg-white/10' };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsData, activityData, healthData] = await Promise.allSettled([
        adminService.getDashboardStats(),
        adminService.getActivityFeed({ limit: 50 }),
        adminService.getSystemHealth(),
      ]);
      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (activityData.status === 'fulfilled') setActivity(activityData.value || []);
      if (healthData.status === 'fulfilled') setHealth(healthData.value);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefreshActivity = async () => {
    setActivityLoading(true);
    try {
      const result = await adminService.getActivityFeed({ limit: 50 });
      setActivity(result || []);
    } catch (error) {
      console.error('Failed to refresh activity:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const votersTotal = stats?.voters?.total || 0;
  const votersVerified = stats?.voters?.verified || 0;
  const votersPending = stats?.voters?.pending || 0;
  const roApproved = stats?.returningOfficers?.approved || 0;
  const roPending = stats?.returningOfficers?.pending || 0;
  const votesCount = stats?.votes || 0;
  const electionsCount = stats?.elections || 0;

  const displayCount = showAllActivity ? 20 : 5;
  const displayedActivity = activity.slice(0, displayCount);
  const hasMore = activity.length > displayCount;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Admin</h1>
          <p className="text-white/50 max-w-xl">
            Monitor and manage the electoral process across all counties. Real-time analytics at your fingertips.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Voters', value: votersTotal, icon: UsersIcon, color: 'from-blue-500 to-blue-600', text: 'text-blue-400' },
          { label: 'Votes Cast', value: votesCount, icon: ClipboardDocumentListIcon, color: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400' },
          { label: 'Elections', value: electionsCount, icon: ClipboardDocumentCheckIcon, color: 'from-purple-500 to-purple-600', text: 'text-purple-400' },
          { label: 'RO Pending', value: roPending, icon: UsersIcon, color: 'from-orange-500 to-orange-600', text: 'text-orange-400', subtext: `${roApproved} approved` },
        ].map((stat, i) => (
          <div key={i} className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
            <div className={`absolute top-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <stat.icon className={`w-6 h-6 ${stat.text} mb-3`} />
            <div className="text-3xl font-bold text-white mb-1">{formatNumber(stat.value)}</div>
            <div className="text-sm text-white/40">{stat.label}</div>
            {stat.subtext && <div className="text-xs text-white/30 mt-1">{stat.subtext}</div>}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${link.color} hover:scale-[1.02] transition-all group`}
                >
                  <link.icon className={`w-6 h-6 ${link.text}`} />
                  <span className="font-medium text-white flex-1">{link.label}</span>
                  <ArrowRightIcon className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Registration Status */}
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-6">Voter Registration Status</h3>
            <div className="space-y-5">
              {[
                { label: 'Total Registered', value: votersTotal, color: 'from-emerald-500 to-teal-500' },
                { label: 'Verified', value: votersVerified, color: 'from-blue-500 to-blue-600' },
                { label: 'Pending Verification', value: votersPending, color: 'from-orange-500 to-orange-600' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">{item.label}</span>
                    <span className="text-sm font-medium text-white">{formatNumber(item.value)}</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r rounded-full transition-all"
                      style={{ 
                        width: votersTotal > 0 ? `${Math.min((item.value / votersTotal) * 100, 100)}%` : '0%',
                        backgroundImage: `linear-gradient(to right, ${item.color.replace('from-', '').split(' ')[0]}, ${item.color.replace('to-', '').split(' ')[1]})`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">{activity.length}</span>
                <button
                  onClick={handleRefreshActivity}
                  disabled={activityLoading}
                  className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${activityLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {displayedActivity.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">No recent activity</p>
              ) : (
                displayedActivity.map((item: any, index: number) => {
                  const { icon: Icon, color, bg } = getActivityIcon(item.action);
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{formatAction(item.action)}</p>
                        <p className="text-xs text-white/30 truncate">
                          {item.resource}{item.resourceId ? ` — ${item.resourceId.slice(0, 8)}...` : ''}
                        </p>
                        <p className="text-xs text-white/20 mt-1">{item.timestamp ? formatDate(item.timestamp) : ''}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {hasMore && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="w-full mt-4 pt-4 border-t border-white/5 text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {showAllActivity ? 'Show Less' : `Show More (${activity.length - displayCount} more)`}
              </button>
            )}
          </div>

          {/* System Health */}
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
            <div className="space-y-4">
              {[
                { label: 'API Server', status: health?.api?.status, color: health?.api?.status === 'healthy' || health?.api?.status === 'operational' },
                { label: 'Database', status: health?.database?.status, color: health?.database?.status === 'healthy' },
                { label: 'Blockchain', status: health?.blockchain?.status, color: health?.blockchain?.status === 'healthy' || health?.blockchain?.status === 'connected' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color ? 'bg-emerald-500' : 'bg-red-500'} ${item.color ? 'animate-pulse' : ''}`} />
                    <span className="text-sm text-white/50">{item.label}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.color ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.status || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}