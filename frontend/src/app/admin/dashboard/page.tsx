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
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '@/components/ui';
import { formatNumber, formatDate } from '@/lib/utils';
import adminService from '@/services/admin';

// Quick links
const quickLinks = [
  { label: 'Manage Returning Officers', href: '/admin/returning-officers', icon: UsersIcon },
  { label: 'Manage Counties', href: '/admin/counties', icon: MapPinIcon },
  { label: 'Manage Candidates', href: '/admin/candidates', icon: ClipboardDocumentListIcon },
  { label: 'Manage Elections', href: '/admin/elections', icon: ClipboardDocumentCheckIcon },
];

// Activity display configuration
const INITIAL_ACTIVITY_COUNT = 5;
const EXPANDED_ACTIVITY_COUNT = 15;

// Format action text for display
function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Get icon for action type
function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes('approved') || lower.includes('created') || lower.includes('verified') || lower.includes('published')) {
    return { icon: CheckCircleIcon, color: 'text-success', bg: 'bg-success-light' };
  }
  if (lower.includes('rejected') || lower.includes('deleted') || lower.includes('failed') || lower.includes('error')) {
    return { icon: ExclamationCircleIcon, color: 'text-error', bg: 'bg-error-light' };
  }
  return { icon: ClockIcon, color: 'text-primary-500', bg: 'bg-primary-50' };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [clearingActivity, setClearingActivity] = useState(false);

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

  const handleClearActivity = async () => {
    setClearingActivity(true);
    try {
      await adminService.clearAuditLogs();
      setActivity([]);
    } catch (error) {
      console.error('Failed to clear activity:', error);
    } finally {
      setClearingActivity(false);
    }
  };

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-500" />
      </div>
    );
  }

  const votersTotal = stats?.voters?.total || 0;
  const votersVerified = stats?.voters?.verified || 0;
  const votersPending = stats?.voters?.pending || 0;
  const countiesCount = stats?.counties || 0;
  const roApproved = stats?.returningOfficers?.approved || 0;
  const roPending = stats?.returningOfficers?.pending || 0;
  const votesCount = stats?.votes || 0;
  const electionsCount = stats?.elections || 0;
  const candidatesPending = stats?.candidates?.pending || 0;

  // Activity display logic
  const displayCount = showAllActivity ? EXPANDED_ACTIVITY_COUNT : INITIAL_ACTIVITY_COUNT;
  const displayedActivity = activity.slice(0, displayCount);
  const hasMore = activity.length > displayCount;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-admin-500 to-admin-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-admin-100">
          Monitor and manage the electoral process across all counties
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Voters */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-50 dark:bg-admin-900/30">
            <UsersIcon className="w-8 h-8 text-admin-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Voters</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{formatNumber(votersTotal)}</span>
            </div>
          </div>
        </Card>

        {/* Votes Cast */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <ClipboardDocumentListIcon className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Votes Cast</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{formatNumber(votesCount)}</span>
            </div>
          </div>
        </Card>

        {/* Elections */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Elections</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{electionsCount}</span>
              <span className="text-xs text-neutral-500">total</span>
            </div>
          </div>
        </Card>

        {/* Returning Officers Pending */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <UsersIcon className="w-8 h-8 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">RO Pending</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{roPending}</span>
              <span className="text-xs text-neutral-500">of {roApproved + roPending}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 p-4 border border-neutral-200 rounded-xl hover:border-admin-300 hover:bg-admin-50 transition-all"
                >
                  <link.icon className="w-6 h-6 text-admin-500" />
                  <span className="font-medium text-neutral-900">{link.label}</span>
                  <ArrowRightIcon className="w-4 h-4 text-neutral-400 ml-auto" />
                </Link>
              ))}
            </div>
          </Card>

          {/* Registration Status */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Voter Registration Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total Registered</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: votersTotal > 0 ? `${Math.min((votersVerified / votersTotal) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(votersTotal)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Verified</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: votersTotal > 0 ? `${Math.min((votersVerified / votersTotal) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(votersVerified)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Pending Verification</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full"
                      style={{ width: votersTotal > 0 ? `${Math.min((votersPending / votersTotal) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(votersPending)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <Badge variant="info">{activity.length} total</Badge>
                <button
                  onClick={handleRefreshActivity}
                  disabled={activityLoading}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded transition-colors"
                  title="Refresh"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${activityLoading ? 'animate-spin' : ''}`} />
                </button>
                {activity.length > 0 && (
                  <button
                    onClick={handleClearActivity}
                    disabled={clearingActivity}
                    className="p-1 text-neutral-400 hover:text-error rounded transition-colors"
                    title="Clear activity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {displayedActivity.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  {activity.length === 0 ? 'No recent activity' : 'No more activity to show'}
                </p>
              ) : (
                displayedActivity.map((item: any) => {
                  const { icon: Icon, color, bg } = getActivityIcon(item.action);
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 text-sm">
                          {formatAction(item.action)}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {item.resource}
                          {item.resourceId ? ` — ${item.resourceId.slice(0, 8)}...` : ''}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {item.timestamp ? formatDate(item.timestamp) : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Show More / Show Less */}
            {hasMore && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="w-full mt-4 pt-3 border-t border-neutral-100 flex items-center justify-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {showAllActivity ? (
                  <>
                    Show Less
                    <ChevronUpIcon className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show More ({activity.length - displayCount} more)
                    <ChevronDownIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </Card>

          {/* System Health */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">System Health</h3>
            <div className="space-y-4">
              {/* API Server */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-5 h-5 ${health?.api?.status === 'healthy' || health?.api?.status === 'operational' ? 'text-success' : 'text-error'}`} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">API Server</span>
                </div>
                <Badge variant={health?.api?.status === 'healthy' || health?.api?.status === 'operational' ? 'success' : 'error'}>
                  {health?.api?.status || 'Unknown'}
                </Badge>
              </div>
              {/* Database */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-5 h-5 ${health?.database?.status === 'healthy' ? 'text-success' : 'text-error'}`} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Database</span>
                </div>
                <Badge variant={health?.database?.status === 'healthy' ? 'success' : 'error'}>
                  {health?.database?.status || 'Unknown'}
                </Badge>
              </div>
              {/* Blockchain */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className={`w-5 h-5 ${health?.blockchain?.status === 'healthy' || health?.blockchain?.status === 'connected' ? 'text-success' : 'text-warning'}`} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Blockchain</span>
                </div>
                <Badge variant={health?.blockchain?.status === 'healthy' || health?.blockchain?.status === 'connected' ? 'success' : 'warning'}>
                  {health?.blockchain?.status || 'Unknown'}
                </Badge>
              </div>
              {/* Redis */}
              {health?.redis && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className={`w-5 h-5 ${health.redis.status === 'healthy' ? 'text-success' : 'text-warning'}`} />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Redis</span>
                  </div>
                  <Badge variant={health.redis.status === 'healthy' ? 'success' : 'warning'}>
                    {health.redis.status || 'Unknown'}
                  </Badge>
                </div>
              )}
              {/* Memory */}
              {health?.memory && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className={`w-5 h-5 ${health.memory.percentage < 80 ? 'text-success' : 'text-warning'}`} />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">Memory</span>
                  </div>
                  <Badge variant={health.memory.percentage < 80 ? 'success' : 'warning'}>
                    {health.memory.used}MB / {health.memory.total}MB ({health.memory.percentage}%)
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
