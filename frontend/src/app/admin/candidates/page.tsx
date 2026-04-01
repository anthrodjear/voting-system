'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import adminService from '@/services/admin';

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    id: string;
    name: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getCandidates({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setCandidates(result.candidates || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'approve') {
        await adminService.approveCandidate(confirmAction.id);
      } else {
        await adminService.rejectCandidate(confirmAction.id, 'Rejected by admin');
      }
      await loadCandidates();
      setConfirmAction(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Candidates</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage candidate applications and approvals</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Approved</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {candidates.filter(c => c.status === 'approved').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light dark:bg-warning-900/20">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {candidates.filter(c => c.status === 'pending').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-error-light dark:bg-error-900/20">
            <XCircleIcon className="w-8 h-8 text-error" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Rejected</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {candidates.filter(c => c.status === 'rejected').length}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or party..."
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="secondary" onClick={loadCandidates}>
              <ArrowPathIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Candidate</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Party</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Position</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">County</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Submitted</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                            <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                              {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                              {candidate.firstName} {candidate.lastName}
                            </span>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{candidate.candidateNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {candidate.partyName || (candidate.isIndependent ? 'Independent' : '-')}
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 capitalize">{candidate.position}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{candidate.countyName || '-'}</td>
                      <td className="px-6 py-4">{getStatusBadge(candidate.status)}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {candidate.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="success"
                              onClick={() => setConfirmAction({ type: 'approve', id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}` })}>
                              Approve
                            </Button>
                            <Button size="sm" variant="danger"
                              onClick={() => setConfirmAction({ type: 'reject', id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}` })}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`${confirmAction?.type === 'approve' ? 'Approve' : 'Reject'} Candidate`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === 'approve' ? 'success' : 'danger'}
              disabled={actionLoading}
              onClick={handleAction}
            >{actionLoading ? 'Processing...' : confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}</Button>
          </div>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to {confirmAction?.type} <strong>{confirmAction?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
