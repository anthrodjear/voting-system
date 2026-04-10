'use client';

import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  MapIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Button } from '@/components/ui';
import adminService from '@/services/admin';

export default function ROProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProposals() {
      try {
        const data = await adminService.getMyProposals();
        setProposals(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProposals();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning"><ClockIcon className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved': return <Badge variant="success"><CheckCircleIcon className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="error"><XCircleIcon className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ro-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">My Proposals</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Track your constituency and ward change proposals</p>
        </div>
        <Button variant="secondary" onClick={() => window.location.reload()}>
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
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {proposals.filter(p => p.status === 'pending').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Approved</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {proposals.filter(p => p.status === 'approved').length}
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
              {proposals.filter(p => p.status === 'rejected').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {proposals.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400">No proposals submitted yet</p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Go to Counties & Wards to propose changes
            </p>
          </Card>
        ) : (
          proposals.map((proposal: any) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${proposal.type === 'constituency' ? 'bg-primary-50 dark:bg-primary-900/30' : 'bg-admin-50 dark:bg-admin-900/30'}
                  `}>
                    {proposal.type === 'constituency' ? (
                      <MapPinIcon className="w-5 h-5 text-primary-500" />
                    ) : (
                      <MapIcon className="w-5 h-5 text-admin-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">{proposal.resourceName}</span>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {proposal.action.charAt(0).toUpperCase() + proposal.action.slice(1)} {proposal.type} • {proposal.countyName} County
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Submitted {new Date(proposal.proposedAt).toLocaleDateString()} at {new Date(proposal.proposedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {proposal.status === 'rejected' && proposal.rejectionReason && (
                  <div className="text-right max-w-xs">
                    <p className="text-xs text-error dark:text-error-300">
                      Reason: {proposal.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
