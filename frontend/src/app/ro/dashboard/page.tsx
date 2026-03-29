'use client';

import Link from 'next/link';
import { 
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Progress, Alert } from '@/components/ui';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

// Mock county data
const countyStats = {
  name: 'Nairobi',
  code: 'NBI',
  totalVoters: 2345678,
  registeredVoters: 2123456,
  verifiedVoters: 1987654,
  pendingRegistrations: 136802,
  candidates: {
    total: 45,
    approved: 38,
    pending: 7,
  },
  votingProgress: 45,
};

// Mock pending approvals
const pendingApprovals = [
  { id: '1', type: 'voter', name: 'John Doe', action: 'Registration', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '2', type: 'candidate', name: 'Jane Smith', action: 'Candidate Application', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'voter', name: 'Robert Johnson', action: 'Registration', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

// Mock activity
const recentActivity = [
  { id: '1', action: 'Voter Verified', details: 'John Doe verified', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: '2', action: 'Candidate Approved', details: 'Mary Njeri approved for Governor', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '3', action: 'Registration Complete', details: '45 new voters registered', timestamp: new Date(Date.now() - 3600000).toISOString() },
];

export default function RODashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-ro-500 to-ro-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <MapPinIcon className="w-5 h-5" />
          <span className="font-medium">{countyStats.name} County</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Returning Officer Dashboard</h1>
        <p className="text-ro-100">
          Manage voter registrations and candidates for {countyStats.name} County
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
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(countyStats.totalVoters)}</span>
          </div>
        </Card>

        {/* Verified Voters */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Verified</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(countyStats.verifiedVoters)}</span>
          </div>
        </Card>

        {/* Pending */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Pending</p>
            <span className="text-2xl font-bold text-neutral-900">{formatNumber(countyStats.pendingRegistrations)}</span>
          </div>
        </Card>

        {/* Candidates */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Candidates</p>
            <span className="text-2xl font-bold text-neutral-900">{countyStats.candidates.approved}/{countyStats.candidates.total}</span>
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
                  <span className="text-neutral-600">Overall Progress</span>
                  <span className="font-medium">{Math.round((countyStats.registeredVoters / countyStats.totalVoters) * 100)}%</span>
                </div>
                <Progress 
                  value={countyStats.registeredVoters} 
                  max={countyStats.totalVoters} 
                  variant="success"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">Registered</p>
                  <p className="text-xl font-bold text-neutral-900">{formatNumber(countyStats.registeredVoters)}</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">Verified</p>
                  <p className="text-xl font-bold text-neutral-900">{formatNumber(countyStats.verifiedVoters)}</p>
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
              <Badge variant="warning">{pendingApprovals.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center gap-3 p-3 bg-warning-light rounded-lg">
                  <ExclamationCircleIcon className="w-5 h-5 text-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">{approval.name}</p>
                    <p className="text-xs text-neutral-500">{approval.action}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" fullWidth className="mt-4">
              View All Pending
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 text-sm">{activity.action}</p>
                    <p className="text-xs text-neutral-500">{activity.details}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
