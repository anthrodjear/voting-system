'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Input, DataTable } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import observerService from '@/services/observer';

interface CandidateResult {
  id: string;
  name: string;
  party: string;
  votes: number;
  percentage: number;
}

// Sort options
const SORT_OPTIONS = [
  { value: 'votes_desc', label: 'Most Votes' },
  { value: 'votes_asc', label: 'Least Votes' },
  { value: 'percentage_desc', label: 'Highest Percentage' },
  { value: 'percentage_asc', label: 'Lowest Percentage' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
];

export default function ObserverCandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes_desc');
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await observerService.getCandidateResults();
      setCandidates(data || []);
    } catch (error) {
      console.error('Failed to load candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    
    const query = searchQuery.toLowerCase();
    return candidates.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.party.toLowerCase().includes(query)
    );
  }, [candidates, searchQuery]);

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    const sorted = [...filteredCandidates];
    const [field, direction] = sortBy.split('_');
    
    sorted.sort((a, b) => {
      let comparison = 0;
      if (field === 'votes') {
        comparison = a.votes - b.votes;
      } else if (field === 'percentage') {
        comparison = a.percentage - b.percentage;
      } else if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return direction === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [filteredCandidates, sortBy]);

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'rank',
      header: '#',
      width: 'w-16',
      render: (_: any, index: number) => (
        <span className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {index + 1}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Candidate',
      render: (row: CandidateResult) => (
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {row.name}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {row.party}
          </p>
        </div>
      ),
    },
    {
      key: 'votes',
      header: 'Votes',
      align: 'right' as const,
      render: (row: CandidateResult) => (
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {formatNumber(row.votes)}
        </span>
      ),
    },
    {
      key: 'percentage',
      header: 'Percentage',
      align: 'right' as const,
      render: (row: CandidateResult) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-24 h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-observer-500 rounded-full"
              style={{ width: `${Math.min(row.percentage, 100)}%` }}
            />
          </div>
          <span className="font-medium text-neutral-900 dark:text-neutral-100 w-14 text-right">
            {row.percentage?.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ], []);

  // Calculate totals
  const totalVotes = useMemo(() => 
    candidates.reduce((sum, c) => sum + c.votes, 0), 
    [candidates]
  );

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Candidate Results
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Live election results by candidate
            </p>
          </div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Total: <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatNumber(totalVotes)} votes
            </span>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-observer-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-observer-500" />
          </div>
        ) : sortedCandidates.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <p>No candidates found.</p>
            {searchQuery && (
              <p className="text-sm mt-2">
                Try adjusting your search query.
              </p>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns as any}
            data={sortedCandidates as any}
            keyField="id"
            emptyMessage="No candidate results available"
          />
        )}

        {/* Footer Stats */}
        {!loading && sortedCandidates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700 flex items-center justify-between text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Showing {sortedCandidates.length} of {filteredCandidates.length} candidates
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Total: {formatNumber(totalVotes)} votes
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}