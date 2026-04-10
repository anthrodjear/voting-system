'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Progress } from '@/components/ui';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import roService from '@/services/ro';

export default function RODashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any>({ pendingVoters: [], pendingCandidates: [] });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, approvalsData, activityData] = await Promise.all([
          roService.getDashboardStats(),
          roService.getPendingApprovals(),
          roService.getRecentActivity(5),
        ]);
        setStats(statsData);
        setPendingApprovals(approvalsData);
        setRecentActivity(activityData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ro-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-light border border-error/20 text-error px-4 py-3 rounded-lg">
        {error}
        <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
      </div>
    );
  }

  const countyName = stats?.assignedCounty?.name || 'Your County';
  const totalVoters = stats?.totalVoters || 0;
  const verifiedVoters = stats?.verifiedVoters || 0;
  const pendingVoters = stats?.pendingVoters || 0;
  const registeredVoters = totalVoters - pendingVoters;

  // Combine pending approvals into a single list
  const pendingVotersList = pendingApprovals?.pendingVoters || [];
  const pendingCandidatesList = pendingApprovals?.pendingCandidates || [];
  const allPending = [
    ...pendingVotersList.map((v: any) => ({
      id: v.id,
      type: 'voter' as const,
      name: `${v.firstName} ${v.lastName}`,
      action: 'Registration',
      timestamp: v.registeredAt,
    })),
    ...pendingCandidatesList.map((c: any) => ({
      id: c.id,
      type: 'candidate' as const,
      name: `${c.firstName} ${c.lastName}`,
      action: 'Candidate Application',
      timestamp: c.submittedAt,
    })),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ro-500 to-ro-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <MapPinIcon className="w-5 h-5" />
          <span className="font-medium">{countyName} County</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Returning Officer Dashboard</h1>
        <p className="text-ro-100">
          Manage voter registrations and candidates for {countyName} County
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Voters */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ro-50">
            <UsersIcon className="w-8 h-8 text-ro-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Total Voters</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(totalVoters)}</span>
          </div>
        </Card>

        {/* Verified Voters */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Verified</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(verifiedVoters)}</span>
          </div>
        </Card>

        {/* Pending */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Pending</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(pendingVoters)}</span>
          </div>
        </Card>

        {/* Total Votes */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Votes Cast</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(stats?.totalVotes || 0)}</span>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registration Progress */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Voter Registration Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Verification Progress</span>
                  <span className="font-medium">
                    {totalVoters > 0 ? Math.round((verifiedVoters / totalVoters) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={verifiedVoters} 
                  max={totalVoters || 1} 
                  variant="success"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">Total Registered</p>
                  <p className="text-xl font-bold text-neutral-900">{formatNumber(totalVoters)}</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">Verified</p>
                  <p className="text-xl font-bold text-neutral-900">{formatNumber(verifiedVoters)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/ro/voters">
                <div className="p-4 border border-neutral-200 rounded-xl hover:border-ro-300 hover:bg-ro-50 transition-all cursor-pointer">
                  <UserPlusIcon className="w-8 h-8 text-ro-500 mb-3" />
                  <h4 className="font-semibold text-neutral-900 mb-1">Verify Voters</h4>
                  <p className="text-sm text-neutral-500">Review pending voter registrations</p>
                </div>
              </Link>
              
              <Link href="/ro/candidates">
                <div className="p-4 border border-neutral-200 rounded-xl hover:border-ro-300 hover:bg-ro-50 transition-all cursor-pointer">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-ro-500 mb-3" />
                  <h4 className="font-semibold text-neutral-900 mb-1">Manage Candidates</h4>
                  <p className="text-sm text-neutral-500">Review and approve candidates</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Pending Approvals</h3>
              <Badge variant="warning">{allPending.length}</Badge>
            </div>
            
            {allPending.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No pending approvals</p>
            ) : (
              <div className="space-y-3">
                {allPending.map((approval) => (
                  <div key={`${approval.type}-${approval.id}`} className="flex items-center gap-3 p-3 bg-warning-light rounded-lg">
                    <ExclamationCircleIcon className="w-5 h-5 text-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm">{approval.name}</p>
                      <p className="text-xs text-neutral-500">{approval.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link href="/ro/voters?status=pending">
              <Button variant="ghost" fullWidth className="mt-4">
                View All Pending
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm">{activity.action}</p>
                      <p className="text-xs text-neutral-500">{activity.details || activity.resource}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
