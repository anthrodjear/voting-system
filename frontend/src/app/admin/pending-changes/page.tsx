'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  MapIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button, Modal } from '@/components/ui';
import adminService from '@/services/admin';

export default function PendingChangesPage() {
  const [changes, setChanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{ id: string; name: string; type: string; action: string } | null>(null);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Expanded counties for filtering
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [changesByCounty, setChangesByCounty] = useState<Record<string, any[]>>({});

  const loadChanges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPendingGeographicChanges();
      setChanges(data || []);

      // Group by county
      const grouped: Record<string, any[]> = {};
      data.forEach((change: any) => {
        if (!grouped[change.countyName]) {
          grouped[change.countyName] = [];
        }
        grouped[change.countyName].push(change);
      });
      setChangesByCounty(grouped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChanges();
  }, [loadChanges]);

  const handleReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await adminService.reviewGeographicChange(reviewModal.id, reviewAction, reviewNotes || undefined);
      setReviewModal(null);
      setReviewNotes('');
      await loadChanges();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning"><ClockIcon className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved': return <Badge variant="success"><CheckCircleIcon className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="error"><XCircleIcon className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const toggleCounty = (countyName: string) => {
    const newExpanded = new Set(expandedCounties);
    if (newExpanded.has(countyName)) {
      newExpanded.delete(countyName);
    } else {
      newExpanded.add(countyName);
    }
    setExpandedCounties(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Pending Geographic Changes</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Review and approve/reject RO proposals for constituencies and wards</p>
        </div>
        <Button variant="secondary" onClick={loadChanges}>
          <ArrowPathIcon className="w-5 h-5 mr-1" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light dark:bg-warning-900/20">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{changes.filter(c => c.status === 'pending').length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Approved</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{changes.filter(c => c.status === 'approved').length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-error-light dark:bg-error-900/20">
            <XCircleIcon className="w-8 h-8 text-error" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Rejected</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{changes.filter(c => c.status === 'rejected').length}</p>
          </div>
        </Card>
      </div>

      {/* Changes by County */}
      <div className="space-y-3">
        {Object.keys(changesByCounty).length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">No pending change proposals</p>
          </Card>
        ) : (
          Object.entries(changesByCounty).map(([countyName, countyChanges]) => (
            <Card key={countyName} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                onClick={() => toggleCounty(countyName)}
              >
                <div className="flex items-center gap-3">
                  {expandedCounties.has(countyName) ? (
                    <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{countyName} County</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{countyChanges.length} proposals</p>
                  </div>
                </div>
              </div>

              {expandedCounties.has(countyName) && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-3">
                  {countyChanges.map((change: any) => (
                    <div key={change.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${change.type === 'constituency' ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-admin-50 dark:bg-admin-900/30'}
                          `}>
                            {change.type === 'constituency' ? (
                              <MapPinIcon className="w-5 h-5 text-primary-500" />
                            ) : (
                              <MapIcon className="w-5 h-5 text-admin-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-neutral-900 dark:text-neutral-100">{change.resourceName}</span>
                              {getStatusBadge(change.status)}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {change.action.charAt(0).toUpperCase() + change.action.slice(1)} {change.type}
                            </p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                              Proposed by <strong>{change.proposedByName}</strong> on {new Date(change.proposedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {change.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="success"
                              onClick={() => setReviewModal({ id: change.id, name: change.resourceName, type: change.type, action: change.action })}>
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="danger"
                              onClick={() => { setReviewModal({ id: change.id, name: change.resourceName, type: change.type, action: change.action }); setReviewAction('rejected'); }}>
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => { setReviewModal(null); setReviewNotes(''); }}
        title={`Review ${reviewModal?.type} Change`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setReviewModal(null); setReviewNotes(''); }}>Cancel</Button>
            <Button
              variant={reviewAction === 'approved' ? 'success' : 'danger'}
              disabled={reviewLoading}
              onClick={handleReview}
            >
              {reviewLoading ? 'Processing...' : reviewAction === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              <strong>Proposal:</strong> {reviewModal?.action} {reviewModal?.type}
            </p>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              <strong>Resource:</strong> {reviewModal?.name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Review Action
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setReviewAction('approved')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  reviewAction === 'approved'
                    ? 'border-success bg-success-light dark:bg-success-900/20 text-success'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <CheckCircleIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Approve</span>
              </button>
              <button
                onClick={() => setReviewAction('rejected')}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  reviewAction === 'rejected'
                    ? 'border-error bg-error-light dark:bg-error-900/20 text-error'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <XCircleIcon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Reject</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notes (optional)
            </label>
            <textarea
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Add a note about this decision..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
