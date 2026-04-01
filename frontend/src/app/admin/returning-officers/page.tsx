'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import adminService from '@/services/admin';

export default function ReturningOfficersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officers, setOfficers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'reactivate' | 'approve' | 'reject';
    id: string;
    name: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOfficers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getReturningOfficers({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        page: pagination.page,
        pageSize: pagination.limit,
      });
      setOfficers(result.officers || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to load returning officers');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    loadOfficers();
  }, [loadOfficers]);

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      switch (confirmAction.type) {
        case 'suspend':
          await adminService.suspendRO(confirmAction.id, 'Suspended by admin');
          break;
        case 'reactivate':
          await adminService.reactivateRO(confirmAction.id);
          break;
        case 'approve':
          await adminService.approveRO(confirmAction.id);
          break;
        case 'reject':
          await adminService.rejectRO(confirmAction.id, 'Rejected by admin');
          break;
      }
      await loadOfficers();
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
      case 'pending':
      case 'submitted':
      case 'draft': return <Badge variant="warning">Pending</Badge>;
      case 'suspended': return <Badge variant="error">Suspended</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Returning Officers</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage Returning Officers across all counties</p>
        </div>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
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
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="secondary" onClick={loadOfficers}>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Assigned County</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Created</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No returning officers found
                    </td>
                  </tr>
                ) : (
                  officers.map((ro) => (
                    <tr key={ro.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-neutral-900 dark:text-neutral-100">{ro.firstName} {ro.lastName}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">ID: {ro.nationalId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{ro.email}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {ro.assignedCountyName || ro.preferredCounty1 || '-'}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(ro.status)}</td>
                      <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                        {ro.createdAt ? new Date(ro.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                            onClick={() => setActionMenu(actionMenu === ro.id ? null : ro.id)}
                          >
                            <EllipsisVerticalIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                          </button>
                          {actionMenu === ro.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-10">
                              {ro.status === 'pending' && (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 text-success"
                                    onClick={() => { setActionMenu(null); setConfirmAction({ type: 'approve', id: ro.id, name: `${ro.firstName} ${ro.lastName}` }); }}
                                  >Approve</button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 text-error"
                                    onClick={() => { setActionMenu(null); setConfirmAction({ type: 'reject', id: ro.id, name: `${ro.firstName} ${ro.lastName}` }); }}
                                  >Reject</button>
                                </>
                              )}
                              {ro.status === 'approved' && (
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 text-warning"
                                  onClick={() => { setActionMenu(null); setConfirmAction({ type: 'suspend', id: ro.id, name: `${ro.firstName} ${ro.lastName}` }); }}
                                >Suspend</button>
                              )}
                              {ro.status === 'suspended' && (
                                <button
                                  className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 text-success"
                                  onClick={() => { setActionMenu(null); setConfirmAction({ type: 'reactivate', id: ro.id, name: `${ro.firstName} ${ro.lastName}` }); }}
                                >Reactivate</button>
                              )}
                            </div>
                          )}
                        </div>
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
        title={`${confirmAction?.type?.charAt(0).toUpperCase()}${confirmAction?.type?.slice(1)} Returning Officer`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === 'suspend' || confirmAction?.type === 'reject' ? 'danger' : 'success'}
              disabled={actionLoading}
              onClick={handleAction}
            >{actionLoading ? 'Processing...' : 'Confirm'}</Button>
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
