'use client';

import Link from 'next/link';
import { 
  UsersIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '@/components/ui';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

// Mock stats data
const stats = {
  voters: {
    total: 24567890,
    registered: 22456789,
    verified: 21234567,
    pending: 1234222,
    change: 5.2,
  },
  votes: {
    total: 15234567,
    turnout: 67.8,
    lastHour: 12345,
  },
  counties: {
    total: 47,
    active: 47,
  },
  ro: {
    total: 470,
    approved: 450,
    pending: 20,
  },
};

// Mock recent activity
const recentActivity = [
  {
    id: '1',
    type: 'ro_application' as const,
    action: 'New RO Application',
    details: 'John Doe applied as Returning Officer for Nairobi County',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'warning' as const,
  },
  {
    id: '2',
    type: 'candidate' as const,
    action: 'Candidate Approved',
    details: 'Candidate Jane Smith approved for Governor position',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'success' as const,
  },
  {
    id: '3',
    type: 'election' as const,
    action: 'Election Published',
    details: 'General Election 2027 status changed to Published',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: 'success' as const,
  },
  {
    id: '4',
    type: 'vote' as const,
    action: 'High Voting Activity',
    details: 'Nairobi County voting activity increased by 45%',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    status: 'success' as const,
  },
];

// Quick links
const quickLinks = [
  { label: 'Manage Returning Officers', href: '/admin/returning-officers', icon: UsersIcon },
  { label: 'Manage Counties', href: '/admin/counties', icon: MapPinIcon },
  { label: 'Manage Candidates', href: '/admin/candidates', icon: ClipboardDocumentListIcon },
  { label: 'Manage Elections', href: '/admin/elections', icon: ClipboardDocumentCheckIcon },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-admin-500 to-admin-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-admin-100">
          Monitor and manage the electoral process across all 47 counties
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Voters */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-50">
            <UsersIcon className="w-8 h-8 text-admin-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Total Voters</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{formatNumber(stats.voters.total)}</span>
              <span className="text-xs font-medium text-success">+{stats.voters.change}%</span>
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
              <span className="text-2xl font-bold text-neutral-900">{formatNumber(stats.votes.total)}</span>
              <span className="text-xs font-medium text-success">+{stats.votes.turnout}%</span>
            </div>
          </div>
        </Card>

        {/* Active Counties */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <MapPinIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Active Counties</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{stats.counties.active}</span>
              <span className="text-xs text-neutral-500">/ {stats.counties.total}</span>
            </div>
          </div>
        </Card>

        {/* Returning Officers */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <UsersIcon className="w-8 h-8 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">RO Pending</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{stats.ro.pending}</span>
              <span className="text-xs text-neutral-500">of {stats.ro.total}</span>
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
                <span className="text-neutral-600">Registered</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: '91%' }} />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(stats.voters.registered)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Verified</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '86%' }} />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(stats.voters.verified)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Pending Verification</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-warning rounded-full" style={{ width: '5%' }} />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-20 text-right">
                    {formatNumber(stats.voters.pending)}
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
              <Badge variant="info">{recentActivity.length} new</Badge>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${activity.status === 'success' ? 'bg-success-light' : 'bg-warning-light'}
                  `}>
                    {activity.status === 'success' ? (
                      <CheckCircleIcon className="w-4 h-4 text-success" />
                    ) : (
                      <ExclamationCircleIcon className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 text-sm">{activity.action}</p>
                    <p className="text-xs text-neutral-500 truncate">{activity.details}</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" fullWidth className="mt-4">
              View All Activity
            </Button>
          </Card>

          {/* System Health */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success" />
                  <span className="text-sm text-neutral-600">API Server</span>
                </div>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success" />
                  <span className="text-sm text-neutral-600">Blockchain</span>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-success" />
                  <span className="text-sm text-neutral-600">Database</span>
                </div>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-warning" />
                  <span className="text-sm text-neutral-600">Backup</span>
                </div>
                <Badge variant="warning">In Progress</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
