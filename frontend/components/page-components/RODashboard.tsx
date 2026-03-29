/**
 * Returning Officer (RO) Dashboard Page Component
 * Welcome, stats, quick actions, pending approvals, voting progress
 */

import React from 'react';
import { Button, Card, Badge, ProgressBar, Alert } from '../../components/ui';
import { Layout } from '../../components/layout';

// ============================================
// SIDEBAR NAV ITEMS
// ============================================

const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    href: '/ro',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: true,
  },
  {
    label: 'Voter Management',
    href: '/ro/voters',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    badge: 23,
  },
  {
    label: 'Candidate List',
    href: '/ro/candidates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    label: 'Voting Progress',
    href: '/ro/progress',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/ro/reports',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/ro/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ============================================
// PENDING APPROVAL ITEM
// ============================================

interface PendingApproval {
  id: string;
  type: 'voter' | 'candidate' | 'document';
  name: string;
  details: string;
  submittedAt: string;
}

const PENDING_APPROVALS: PendingApproval[] = [
  {
    id: '1',
    type: 'voter',
    name: 'Voter Registration',
    details: 'John Doe - ID: 12345678',
    submittedAt: '10 minutes ago',
  },
  {
    id: '2',
    type: 'candidate',
    name: 'Candidate Nomination',
    details: 'Mary Wanjiku - Governor Position',
    submittedAt: '25 minutes ago',
  },
  {
    id: '3',
    type: 'document',
    name: 'Document Upload',
    details: 'Polling Station Equipment Report',
    submittedAt: '1 hour ago',
  },
  {
    id: '4',
    type: 'voter',
    name: 'Voter Update',
    details: 'Update Request - Change of Ward',
    submittedAt: '2 hours ago',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export const RODashboardPage: React.FC = () => {
  const user = {
    name: 'Mary Wanjiku',
    role: 'Returning Officer',
  };

  const stats = [
    {
      label: 'Registered Voters',
      value: '847,293',
      trend: { value: 124, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Candidates',
      value: '24',
      trend: { value: 0, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label: 'Votes Cast',
      value: '512,847',
      trend: { value: 8.4, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Turnout',
      value: '60.5%',
      trend: { value: 2.1, isPositive: true },
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  const votingProgress = {
    totalVoters: 847293,
    voted: 512847,
    percentage: 60.5,
    hoursRemaining: 498,
    pollingStations: {
      total: 245,
      reporting: 243,
    },
  };

  const typeColors = {
    voter: 'bg-blue-50 text-blue-500',
    candidate: 'bg-green-50 text-green-500',
    document: 'bg-purple-50 text-purple-500',
  };

  const typeIcons = {
    voter: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    candidate: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    document: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };

  return (
    <Layout
      role="returning-officer"
      sidebarItems={SIDEBAR_ITEMS}
      title="Dashboard"
      user={user}
      notifications={4}
    >
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-ro-500 to-ro-600 rounded-2xl p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name}</h1>
            <p className="text-ro-100">Nairobi County Returning Officer</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{votingProgress.hoursRemaining}</div>
            <div className="text-ro-200 text-sm">Hours to election close</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} variant="default" className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-ro-50 text-ro-500">
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
            <h3 className="text-lg font-semibold text-neutral-900">Voting Progress</h3>
            <Badge variant="success" pulse>Live</Badge>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600">Total Votes Cast</span>
                <span className="font-semibold">
                  {votingProgress.voted.toLocaleString()} / {votingProgress.totalVoters.toLocaleString()}
                </span>
              </div>
              <ProgressBar 
                value={votingProgress.voted} 
                max={votingProgress.totalVoters} 
                size="lg"
                color="success"
              />
              <p className="text-right text-sm text-neutral-500 mt-2">{votingProgress.percentage}% turnout</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-ro-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-ro-500">{votingProgress.hoursRemaining}</p>
                <p className="text-xs text-neutral-500">Hours Left</p>
              </div>
              <div className="bg-ro-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-ro-500">
                  {votingProgress.pollingStations.reporting}/{votingProgress.pollingStations.total}
                </p>
                <p className="text-xs text-neutral-500">Stations Reporting</p>
              </div>
              <div className="bg-ro-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-ro-500">2</p>
                <p className="text-xs text-neutral-500">Pending Issues</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Pending Approvals */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Pending Approvals</h3>
            <Badge variant="warning">{PENDING_APPROVALS.length}</Badge>
          </div>

          <div className="space-y-3">
            {PENDING_APPROVALS.map((approval) => (
              <div 
                key={approval.id}
                className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div className={`p-2 rounded-lg ${typeColors[approval.type]}`}>
                  {typeIcons[approval.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm">{approval.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{approval.details}</p>
                  <p className="text-xs text-neutral-400 mt-1">{approval.submittedAt}</p>
                </div>
                <Button variant="ghost" size="sm">Review</Button>
              </div>
            ))}
          </div>

          <Button variant="secondary" fullWidth className="mt-4">
            View All Approvals
          </Button>
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
            Register Voter
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Approve Candidate
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </Button>
          <Button variant="secondary" fullWidth>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </Button>
        </div>
      </div>

      {/* Alert */}
      <Alert variant="info">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">Election Day Reminder</p>
            <p className="text-sm">Ensure all polling stations report their results by 6:00 PM. Contact HQ for any issues.</p>
          </div>
        </div>
      </Alert>
    </Layout>
  );
};

export default RODashboardPage;
