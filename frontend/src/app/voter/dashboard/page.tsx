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
  CalendarDaysIcon
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

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch registration status
        const statusResponse = await getRegistrationStatus();
        setRegistrationStatus(statusResponse);
        
        // Fetch upcoming elections
        const electionsResponse = await getUpcomingElections();
        setUpcomingElections(electionsResponse);
        
        // Fetch notifications from real API
        try {
          const notificationsResponse = await getNotifications();
          setNotifications(notificationsResponse);
        } catch {
          // Notifications fetch failure is non-critical
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

  // Calculate days until next election
  const daysUntilElection = upcomingElections.length > 0 
    ? Math.ceil((new Date(upcomingElections[0].votingStart).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  // Check if voting is currently open
  const hasOpenVote = upcomingElections.some(election => election.status === 'voting_open');
  
  // Check if voter can vote (registered and voting is open)
  const canVote = registrationStatus.status === 'verified' && hasOpenVote;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-voter-500 to-voter-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName || 'Voter'}!
        </h1>
        <p className="text-voter-100">
          Your voice matters. Participate in Kenya's democratic process.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Registration Status Card */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-voter-50">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-voter-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Registration Status</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {registrationStatus.status === 'verified' ? 'Verified' : 
                 registrationStatus.status === 'pending' ? 'Pending Verification' :
                 registrationStatus.status === 'rejected' ? 'Registration Rejected' :
                 'Not Registered'}
              </span>
              {registrationStatus.status === 'verified' && (
                <CheckCircleIcon className="w-6 h-6 text-success" />
              )}
              {registrationStatus.status === 'pending' && (
                <ClockIcon className="w-6 h-6 text-warning" />
              )}
              {registrationStatus.status === 'rejected' && (
                <ExclamationTriangleIcon className="w-6 h-6 text-error" />
              )}
            </div>
            {registrationStatus.message && (
              <p className="text-xs text-neutral-500 mt-1">{registrationStatus.message}</p>
            )}
          </div>
        </Card>

        {/* Next Election Countdown */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <CalendarDaysIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Next Election</p>
            <span className="text-2xl font-bold text-neutral-900">
              {daysUntilElection} days
            </span>
          </div>
        </Card>

        {/* Voting Power */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <ClipboardDocumentListIcon className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">Your Vote</p>
            <span className="text-2xl font-bold text-neutral-900">
              {canVote ? 'Ready to Cast' : 
               registrationStatus.status !== 'verified' ? 'Registration Required' : 
               'Awaiting Election'}
            </span>
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
              <Link href="/voter/register">
                <div className="p-4 border border-neutral-200 rounded-xl hover:border-voter-300 hover:bg-voter-50 transition-all cursor-pointer">
                  <ClipboardDocumentCheckIcon className="w-8 h-8 text-voter-500 mb-3" />
                  <h4 className="font-semibold text-neutral-900 mb-1">Complete Registration</h4>
                  <p className="text-sm text-neutral-500">Verify your identity and register to vote</p>
                </div>
              </Link>
              
              {canVote ? (
                <Link href="/voter/vote">
                  <div className="p-4 border border-neutral-200 rounded-xl hover:border-success-300 hover:bg-success-light transition-all cursor-pointer">
                    <ClipboardDocumentListIcon className="w-8 h-8 text-success mb-3" />
                    <h4 className="font-semibold text-neutral-900 mb-1">Cast Your Vote</h4>
                    <p className="text-sm text-neutral-500">Participate in upcoming elections</p>
                  </div>
                </Link>
              ) : (
                <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 cursor-not-allowed">
                  <ClipboardDocumentListIcon className="w-8 h-8 text-neutral-400 mb-3" />
                  <h4 className="font-semibold text-neutral-500 mb-1">Cast Your Vote</h4>
                  <p className="text-sm text-neutral-400">
                    {!hasOpenVote 
                      ? 'No elections currently open for voting' 
                      : 'Complete registration to vote'
                    }
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upcoming Elections */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Upcoming Elections</h3>
              <Link href="/voter/elections" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                View All <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingElections.map((election) => (
                <div 
                  key={election.id}
                  className="p-4 bg-neutral-50 rounded-xl border border-neutral-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{election.name}</h4>
                      <p className="text-sm text-neutral-500">{election.type}</p>
                    </div>
                    <Badge 
                      variant={election.status === 'registration_open' ? 'success' : 'info'}
                    >
                      {election.status === 'registration_open' ? 'Registration Open' : 'Upcoming'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Registration Deadline</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(election.registrationDeadline)}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Voting Dates</p>
                      <p className="font-medium text-neutral-900">
                        {formatDate(election.votingStart)} - {formatDate(election.votingEnd)}
                      </p>
                    </div>
                  </div>

                  {election.status === 'registration_open' && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Registration Progress</span>
                        <span className="text-sm font-medium text-neutral-700">75%</span>
                      </div>
                      <Progress value={75} variant="success" size="sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
              <Badge variant="warning">{notifications.filter(n => !n.read).length} new</Badge>
            </div>
            
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg ${
                    notification.read ? 'bg-neutral-50' : 'bg-voter-50 border-l-4 border-voter-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <BellIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{notification.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" fullWidth className="mt-4">
              View All Notifications
            </Button>
          </Card>

          {/* Registration Reminder */}
          {registrationStatus.status !== 'verified' && (
            <Card className={`border-l-4 ${
              registrationStatus.status === 'rejected' 
                ? 'bg-error-light border-l-error' 
                : 'bg-warning-light border-l-warning'
            }`}>
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className={`w-6 h-6 flex-shrink-0 ${
                  registrationStatus.status === 'rejected' ? 'text-error' : 'text-warning'
                }`} />
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-1">
                    {registrationStatus.status === 'rejected' 
                      ? 'Registration Rejected' 
                      : registrationStatus.status === 'pending'
                      ? 'Registration Pending'
                      : 'Complete Your Registration'}
                  </h4>
                  <p className="text-sm text-neutral-600 mb-3">
                    {registrationStatus.status === 'rejected'
                      ? 'Your registration was rejected. Please contact support or re-register with corrected information.'
                      : registrationStatus.status === 'pending'
                      ? 'Your registration is being reviewed. You will be notified once verification is complete.'
                      : 'You\'re not fully registered yet. Complete the process to participate in upcoming elections.'}
                  </p>
                  {registrationStatus.status !== 'pending' && (
                    <Link href="/voter/register">
                      <Button size="sm">
                        {registrationStatus.status === 'rejected' ? 'Re-register' : 'Complete Registration'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Help & Support */}
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Need Help?</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900">
                <ClockIcon className="w-5 h-5" />
                <span className="text-sm">Help Center</span>
              </a>
              <a href="#" className="flex items-center gap-3 text-neutral-600 hover:text-neutral-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">Contact Support</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
