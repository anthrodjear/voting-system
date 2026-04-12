'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  UsersIcon,
  ClipboardDocumentCheckIcon,
  ChartPieIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import observerService from '@/services/observer';

interface Stats {
  totalRegistered: number;
  totalVotes: number;
  turnoutPercentage: number;
  electionStatus: string;
}

interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

export default function ObserverDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, candidatesData] = await Promise.allSettled([
        observerService.getElectionStats(),
        observerService.getCandidateResults(),
      ]);
      
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (candidatesData.status === 'fulfilled') {
        setCandidates(candidatesData.value || []);
      }
    } catch (error) {
      console.error('Failed to load observer data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get leading candidate
  const leadingCandidate = candidates.reduce((prev, current) => 
    current.votes > prev.votes ? current : prev, candidates[0] || { id: '', name: '', party: '', votes: 0, percentage: 0 });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-observer-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-observer-500 to-observer-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Live Election Observer</h1>
        <p className="text-observer-100">
          Real-time monitoring of election results as votes are counted
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Auto-refresh toggle */}
        <Button
          variant={autoRefresh ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="flex items-center gap-2"
        >
          {autoRefresh ? (
            <>
              <PauseIcon className="w-4 h-4" />
              Auto-refresh ON
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Auto-refresh OFF
            </>
          )}
        </Button>

        {/* Manual refresh button */}
<Button
          variant="secondary"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Now
        </Button>

        {/* Status indicator */}
        <div className="ml-auto flex items-center gap-2 text-sm text-neutral-500">
          <CheckCircleIcon className="w-4 h-4 text-success" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registered */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-observer-50 dark:bg-observer-900/30">
            <UsersIcon className="w-8 h-8 text-observer-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Registered</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(stats?.totalRegistered || 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Votes Cast */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-success" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Votes Cast</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {formatNumber(stats?.totalVotes || 0)}
              </span>
            </div>
          </div>
        </Card>

        {/* Turnout */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <ChartPieIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Turnout</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats?.turnoutPercentage?.toFixed(1) || 0}%
              </span>
            </div>
          </div>
        </Card>

        {/* Election Status */}
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClipboardDocumentCheckIcon className="w-8 h-8 text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Status</p>
            <Badge 
              variant={
                stats?.electionStatus === 'active' ? 'success' : 
                stats?.electionStatus === 'completed' ? 'info' : 'warning'
              }
            >
              {stats?.electionStatus || 'Unknown'}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Live Results */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Live Results
          </h3>
          {/* Leading candidate badge */}
          {leadingCandidate && leadingCandidate.votes > 0 && (
            <Badge variant="success" className="flex items-center gap-1">
              <span>Leading:</span>
              <span className="font-semibold">{leadingCandidate.name}</span>
              <span>({leadingCandidate.percentage?.toFixed(1)}%)</span>
            </Badge>
          )}
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            <p>No results available yet.</p>
            <p className="text-sm mt-2">Results will appear once votes are counted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={candidate.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {candidate.party}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatNumber(candidate.votes)} votes
                    </p>
                    <p className="text-sm text-neutral-500">
                      {candidate.percentage?.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      index === 0 ? 'bg-observer-500' : 'bg-primary-500'
                    )}
                    style={{ width: `${Math.min(candidate.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total votes */}
        {candidates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Total votes counted</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatNumber(candidates.reduce((sum, c) => sum + c.votes, 0))}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}