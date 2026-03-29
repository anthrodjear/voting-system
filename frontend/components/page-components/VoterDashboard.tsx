/**
 * Voter Dashboard Page Component
 * Status, elections, quick actions, countdown
 */

import React from 'react';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import { VoterLayout } from '../../components/layout';

export const VoterDashboardPage: React.FC = () => {
  const voter = {
    name: 'John Omondi',
    voterId: 'VR-2026-001547',
    status: 'verified',
    biometricStatus: 'complete',
  };

  const upcomingElections = [
    {
      id: 1,
      name: 'General Election 2027',
      date: 'August 8, 2027',
      status: 'upcoming',
      daysRemaining: 498,
    },
    {
      id: 2,
      name: 'County By-Election',
      date: 'December 15, 2026',
      status: 'pending',
      daysRemaining: 262,
    },
  ];

  const quickActions = [
    {
      label: 'Cast Vote',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-voter-50 text-voter-500 hover:bg-voter-100',
      href: '/vote',
    },
    {
      label: 'View Receipt',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-blue-50 text-blue-500 hover:bg-blue-100',
      href: '/receipts',
    },
    {
      label: 'Update Profile',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-purple-50 text-purple-500 hover:bg-purple-100',
      href: '/profile',
    },
    {
      label: 'Election Info',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-amber-50 text-amber-500 hover:bg-amber-100',
      href: '/elections',
    },
  ];

  return (
    <VoterLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome back, {voter.name}</h1>
        <p className="text-neutral-500">Manage your voter registration and cast your vote securely</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Registration Status */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-voter-50">
            <svg className="w-6 h-6 text-voter-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Registration</p>
            <Badge variant="success">{voter.status}</Badge>
          </div>
        </Card>

        {/* Voter ID */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-50">
            <svg className="w-6 h-6 text-admin-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Voter ID</p>
            <p className="font-mono font-semibold">{voter.voterId}</p>
          </div>
        </Card>

        {/* Biometric Status */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ro-50">
            <svg className="w-6 h-6 text-ro-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Biometrics</p>
            <Badge variant="success">{voter.biometricStatus}</Badge>
          </div>
        </Card>

        {/* Next Election */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Next Election</p>
            <p className="font-semibold">498 days</p>
          </div>
        </Card>
      </div>

      {/* Upcoming Elections */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Upcoming Elections</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingElections.map((election) => (
            <Card key={election.id} variant="interactive" padding="lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-neutral-900">{election.name}</h3>
                  <p className="text-sm text-neutral-500">{election.date}</p>
                </div>
                <Badge variant={election.status === 'upcoming' ? 'success' : 'warning'}>
                  {election.status}
                </Badge>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-500">Time Remaining</span>
                  <span className="font-medium">{election.daysRemaining} days</span>
                </div>
                <ProgressBar 
                  value={498 - election.daysRemaining} 
                  max={498} 
                  size="sm"
                  color="voter"
                />
              </div>

              <Button 
                variant={election.status === 'upcoming' ? 'primary' : 'secondary'} 
                fullWidth
                disabled={election.status !== 'upcoming'}
              >
                {election.status === 'upcoming' ? 'Cast Vote' : 'Not Available'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`
                flex flex-col items-center justify-center p-6 rounded-xl transition-all
                ${action.color}
              `}
            >
              {action.icon}
              <span className="mt-2 font-medium text-neutral-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Election Countdown Banner */}
      <Card variant="elevated" className="mt-8 bg-gradient-to-r from-voter-500 to-voter-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">General Election 2027</h3>
            <p className="text-voter-100">August 8, 2027</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">498</div>
            <div className="text-voter-200 text-sm">Days to go</div>
          </div>
        </div>
      </Card>
    </VoterLayout>
  );
};

export default VoterDashboardPage;
