/**
 * Admin Dashboard Page Component
 * Stats grid, activity feed, sidebar navigation
 */

import React from 'react';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import { Layout } from '../../components/layout';

// ============================================
// SIDEBAR NAV ITEMS
// ============================================

const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: true,
  },
  {
    label: 'Voter Management',
    href: '/admin/voters',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    badge: 145,
  },
  {
    label: 'Candidates',
    href: '/admin/candidates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    label: 'Elections',
    href: '/admin/elections',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'County Assignment',
    href: '/admin/counties',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'System Settings',
    href: '/admin/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ============================================
// ACTIVITY ITEM
// ============================================

interface ActivityItem {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
}

const ACTIVITY_FEED: ActivityItem[] = [
  {
    id: '1',
    type: 'success',
    title: 'Voter Registration Approved',
    description: '1,247 new voters approved for Nairobi County',
    timestamp: '2 minutes ago',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Pending Verification',
    description: '342 voter applications awaiting review',
    timestamp: '15 minutes ago',
  },
  {
    id: '3',
    type: 'info',
    title: 'Election Started',
    description: 'General Election 2027 voting period has begun',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'success',
    title: 'Blockchain Sync Complete',
    description: 'All 5,000 votes processed successfully',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    type: 'error',
    title: 'Failed Biometric Scan',
    description: '23 voters require re-enrollment',
    timestamp: '3 hours ago',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const AdminDashboardPage: React.FC = () => {
  const user = {
    name: 'Admin User',
    role: 'System Administrator',
  };

  const stats = [
    {
      label: 'Total Voters',
      value: '20,847,392',
      trend: { value: 2.4, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'admin',
    },
    {
      label: 'Votes Cast',
      value: '12,459,821',
      trend: { value: 8.7, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'success',
    },
    {
      label: 'Counties',
      value: '47',
      trend: { value: 0, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'info',
    },
    {
      label: 'Active ROs',
      value: '2,847',
      trend: { value: 5.2, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'primary',
    },
  ];

  const electionStats = {
    totalVoters: 20847392,
    voted: 12459821,
    percentage: 59.8,
    hoursRemaining: 498,
  };

  return (
    <Layout
      role="admin"
      sidebarItems={SIDEBAR_ITEMS}
      title="Admin Dashboard"
      user={user}
      notifications={12}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} variant="default" className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-500`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-neutral-900">{stat.value}</span>
                {stat.trend.value > 0 && (
                  <span className={`text-sm font-medium ${stat.trend.isPositive ? 'text-success' : 'text-error'}`}>
                    ↑ {stat.trend.value}%
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voting Progress */}
        <Card variant="default" padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Election Overview</h3>
            <Badge variant="success" pulse>Live</Badge>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">Total Votes Cast</span>
                <span className="font-semibold">{electionStats.voted.toLocaleString()} / {electionStats.totalVoters.toLocaleString()}</span>
              </div>
              <ProgressBar 
                value={electionStats.voted} 
                max={electionStats.totalVoters} 
                size="lg"
                color="primary"
              />
              <p className="text-right text-sm text-neutral-500 mt-2">{electionStats.percentage}% turnout</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-admin-500">{electionStats.hoursRemaining}</p>
                <p className="text-xs text-neutral-500">Hours Remaining</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-success">5,000</p>
                <p className="text-xs text-neutral-500">Votes/Second</p>
              </div>
              <div className="bg-neutral-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-admin-500">47/47</p>
                <p className="text-xs text-neutral-500">Counties Reporting</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Feed */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Activity Feed</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>

          <div className="space-y-4">
            {ACTIVITY_FEED.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className={`
                  w-2 h-2 rounded-full mt-2 flex-shrink-0
                  ${activity.type === 'success' ? 'bg-success' : ''}
                  ${activity.type === 'warning' ? 'bg-warning' : ''}
                  ${activity.type === 'error' ? 'bg-error' : ''}
                  ${activity.type === 'info' ? 'bg-info' : ''}
                `} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{activity.title}</p>
                  <p className="text-xs text-neutral-500">{activity.description}</p>
                  <p className="text-xs text-neutral-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add Voter
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verify Candidate
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Create Election
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
