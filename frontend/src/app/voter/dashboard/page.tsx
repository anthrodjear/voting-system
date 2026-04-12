'use client';

import Link from 'next/link';
import { 
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Progress, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils';
import { getRegistrationStatus, getUpcomingElections, RegistrationStatusResponse } from '@/services';
import { getNotifications } from '@/services/notification';
import { useState, useEffect } from 'react';

export default function VoterDashboardPage() {
  const { user } = useAuthStore();
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatusResponse>({ status: 'not_registered' });
  const [upcomingElections, setUpcomingElections] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<any>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const statusResponse = await getRegistrationStatus();
        setRegistrationStatus(statusResponse);
        
        const electionsResponse = await getUpcomingElections();
        setUpcomingElections(electionsResponse);
        
        try {
          const notificationsResponse = await getNotifications();
          setNotifications(notificationsResponse);
        } catch {
          setNotifications([]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const daysUntilElection = upcomingElections.length > 0 
    ? Math.ceil((new Date(upcomingElections[0].votingStart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const hasOpenVote = upcomingElections.some(election => election.status === 'voting_open');
  const canVote = registrationStatus.status === 'verified' && hasOpenVote;

  const getStatusColor = () => {
    switch (registrationStatus.status) {
      case 'verified': return 'text-emerald-400';
      case 'pending': return 'text-amber-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  const getStatusBg = () => {
    switch (registrationStatus.status) {
      case 'verified': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 border-amber-500/20';
      case 'rejected': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-neutral-500/10 border-neutral-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-voter-500/30 border-t-voter-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - Linear style */}
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="text-2xl font-semibold text-white mb-1">
          Welcome back, {user?.firstName || 'Voter'}
        </h1>
        <p className="text-neutral-400 text-sm">
          Your voice matters. Participate in Kenya's democratic process.
        </p>
      </div>

      {/* Stats Row - Linear style inline stats */}
      <div className="grid grid-cols-3 gap-px bg-neutral-800 rounded-lg overflow-hidden divide-x divide-neutral-800">
        <div className="bg-neutral-900/50 px-5 py-4">
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Registration</p>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-medium ${getStatusColor()}`}>
              {registrationStatus.status === 'verified' ? 'Verified' : 
               registrationStatus.status === 'pending' ? 'Pending' :
               registrationStatus.status === 'rejected' ? 'Rejected' :
               'Not Registered'}
            </span>
            {registrationStatus.status === 'verified' && (
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            )}
          </div>
        </div>
        
        <div className="bg-neutral-900/50 px-5 py-4">
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Next Election</p>
          <span className="text-lg font-medium text-white">
            {daysUntilElection} days
          </span>
        </div>
        
        <div className="bg-neutral-900/50 px-5 py-4">
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Your Vote</p>
          <span className="text-lg font-medium text-white">
            {canVote ? 'Ready to Cast' : 
             registrationStatus.status !== 'verified' ? 'Register First' : 
             'Awaiting Election'}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions - Minimal style */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/voter/register">
                <div className="group px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-voter-500/50 hover:bg-voter-500/5 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-voter-500/10">
                      <ClipboardDocumentCheckIcon className="w-4 h-4 text-voter-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-voter-400 transition-colors">Complete Registration</p>
                      <p className="text-xs text-neutral-500">Verify your identity</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-voter-400 transition-colors" />
                  </div>
                </div>
              </Link>
              
              {canVote ? (
                <Link href="/voter/vote">
                  <div className="group px-4 py-3 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-emerald-500/10">
                        <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">Cast Your Vote</p>
                        <p className="text-xs text-neutral-500">Participate in elections</p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="px-4 py-3 bg-neutral-900/30 border border-neutral-800/50 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-neutral-800">
                      <ClipboardDocumentListIcon className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Cast Your Vote</p>
                      <p className="text-xs text-neutral-600">
                        {!hasOpenVote ? 'No elections open' : 'Complete registration first'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Elections - List style */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Upcoming Elections</h2>
              <Link href="/voter/elections" className="text-xs text-voter-400 hover:text-voter-300 flex items-center gap-1">
                View All <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              {upcomingElections.map((election, index) => (
                <div 
                  key={election.id}
                  className={`px-4 py-4 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors ${
                    index !== upcomingElections.length - 1 ? 'border-b border-neutral-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-medium text-white">{election.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          election.status === 'registration_open' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {election.status === 'registration_open' ? 'Registration Open' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-neutral-500">
                        <span>Registration: {formatDate(election.registrationDeadline)}</span>
                        <span>Voting: {formatDate(election.votingStart)} - {formatDate(election.votingEnd)}</span>
                      </div>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-neutral-600" />
                  </div>
                </div>
              ))}
              
              {upcomingElections.length === 0 && (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                  No upcoming elections
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Alert */}
          {registrationStatus.status !== 'verified' && (
            <div className={`px-4 py-3 rounded-lg border ${getStatusBg()}`}>
              <div className="flex items-start gap-3">
                {registrationStatus.status === 'verified' ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : registrationStatus.status === 'pending' ? (
                  <ClockIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-1">
                    {registrationStatus.status === 'rejected' ? 'Registration Rejected' : 
                     registrationStatus.status === 'pending' ? 'Registration Pending' : 
                     'Complete Your Registration'}
                  </p>
                  <p className="text-xs text-neutral-400 mb-3">
                    {registrationStatus.status === 'rejected'
                      ? 'Please re-register with corrected information.'
                      : registrationStatus.status === 'pending'
                      ? 'Your registration is being reviewed.'
                      : 'Register to participate in elections.'}
                  </p>
                  {registrationStatus.status !== 'pending' && (
                    <Link href="/voter/register">
                      <Button size="sm" variant={registrationStatus.status === 'rejected' ? 'destructive' : 'primary'}>
                        {registrationStatus.status === 'rejected' ? 'Re-register' : 'Complete Registration'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-voter-500/10 text-voter-400 border border-voter-500/20">
                  {notifications.filter(n => !n.read)} new
                </span>
              )}
            </div>
            
            <div className="border border-neutral-800 rounded-lg overflow-hidden">
              {notifications.slice(0, 4).map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-neutral-900/30 transition-colors ${
                    index !== Math.min(notifications.length, 4) - 1 ? 'border-b border-neutral-800' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <BellIcon className="w-4 h-4 text-neutral-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-white">{notification.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-center text-neutral-500 text-sm">
                  No notifications
                </div>
              )}
            </div>
          </div>

          {/* Help Links - Minimal */}
          <div>
            <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-3">Help</h2>
            <div className="space-y-1">
              <Link href="#" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-neutral-900/50">
                <ChevronRightIcon className="w-3 h-3" />
                Help Center
              </Link>
              <Link href="#" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-neutral-900/50">
                <ChevronRightIcon className="w-3 h-3" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}