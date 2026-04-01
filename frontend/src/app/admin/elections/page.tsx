'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Modal, Input } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import adminService from '@/services/admin';

export default function ElectionsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    electionName: '',
    electionType: 'general',
    electionDate: '',
    votingStartDate: '',
    votingEndDate: '',
    enableOnlineVoting: true,
  });
  const [confirmAction, setConfirmAction] = useState<{
    type: 'publish' | 'startRegistration' | 'openVoting' | 'closeVoting' | 'publishResults' | 'delete';
    id: string;
    name: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadElections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getElections();
      setElections(result.elections || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  const handleCreate = async () => {
    setCreateLoading(true);
    try {
      await adminService.createElection(formData);
      setShowCreateModal(false);
      setFormData({
        electionName: '',
        electionType: 'general',
        electionDate: '',
        votingStartDate: '',
        votingEndDate: '',
        enableOnlineVoting: true,
      });
      await loadElections();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      const statusMap: Record<string, string> = {
        publish: 'published',
        startRegistration: 'registration_open',
        openVoting: 'voting_open',
        closeVoting: 'voting_closed',
        publishResults: 'results_published',
      };

      if (confirmAction.type === 'delete') {
        await adminService.deleteElection(confirmAction.id);
      } else {
        await adminService.updateElectionStatus(confirmAction.id, statusMap[confirmAction.type]);
      }
      await loadElections();
      setConfirmAction(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="neutral">Draft</Badge>;
      case 'published': return <Badge variant="info">Published</Badge>;
      case 'registration_open': return <Badge variant="warning">Registration Open</Badge>;
      case 'voting_open': return <Badge variant="success">Voting Open</Badge>;
      case 'voting_closed': return <Badge variant="error">Voting Closed</Badge>;
      case 'results_published': return <Badge variant="primary">Results Published</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'general': return <Badge variant="primary">General</Badge>;
      case 'by-election': return <Badge variant="info">By-election</Badge>;
      case 'primary': return <Badge variant="secondary">Primary</Badge>;
      default: return <Badge variant="neutral">{type}</Badge>;
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Elections</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Create and manage elections</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadElections}>
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Election
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <CalendarIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Elections</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{elections.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <PlayIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Active</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {elections.filter(e => e.status === 'voting_open').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light dark:bg-warning-900/20">
            <CalendarIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Upcoming</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {elections.filter(e => ['published', 'registration_open'].includes(e.status)).length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <CalendarIcon className="w-8 h-8 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Draft</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {elections.filter(e => e.status === 'draft').length}
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {elections.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">No elections found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Election
            </Button>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={election.id} className="hover:shadow-md dark:hover:shadow-none transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{election.electionName}</h3>
                    {getTypeBadge(election.electionType)}
                    {getStatusBadge(election.status)}
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(election.electionDate)}</span>
                    </div>
                    {election.registeredVoters !== undefined && (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        <span>{election.registeredVoters?.toLocaleString() || 0} Registered</span>
                      </div>
                    )}
                    {election.candidateCount !== undefined && (
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4" />
                        <span>{election.candidateCount} Candidates</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {election.status === 'draft' && (
                    <>
                      <Button variant="secondary" size="sm"
                        onClick={() => setConfirmAction({ type: 'publish', id: election.id, name: election.electionName })}>
                        Publish
                      </Button>
                      <Button variant="danger" size="sm"
                        onClick={() => setConfirmAction({ type: 'delete', id: election.id, name: election.electionName })}>
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {election.status === 'published' && (
                    <Button variant="success" size="sm"
                      onClick={() => setConfirmAction({ type: 'startRegistration', id: election.id, name: election.electionName })}>
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Start Registration
                    </Button>
                  )}
                  {election.status === 'registration_open' && (
                    <Button variant="success" size="sm"
                      onClick={() => setConfirmAction({ type: 'openVoting', id: election.id, name: election.electionName })}>
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Open Voting
                    </Button>
                  )}
                  {election.status === 'voting_open' && (
                    <Button variant="danger" size="sm"
                      onClick={() => setConfirmAction({ type: 'closeVoting', id: election.id, name: election.electionName })}>
                      <StopIcon className="w-4 h-4 mr-1" />
                      Close Voting
                    </Button>
                  )}
                  {election.status === 'voting_closed' && (
                    <Button size="sm"
                      onClick={() => setConfirmAction({ type: 'publishResults', id: election.id, name: election.electionName })}>
                      Publish Results
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Election"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button disabled={createLoading || !formData.electionName || !formData.electionDate}
              onClick={handleCreate}>
              {createLoading ? 'Creating...' : 'Create Election'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Election Name</label>
            <input type="text"
              className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="e.g., General Election 2027"
              value={formData.electionName}
              onChange={(e) => setFormData(f => ({ ...f, electionName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Election Type</label>
            <select className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.electionType}
              onChange={(e) => setFormData(f => ({ ...f, electionType: e.target.value }))}>
              <option value="general">General Election</option>
              <option value="by-election">By-election</option>
              <option value="primary">Primary Election</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Election Date</label>
              <input type="date"
                className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.electionDate}
                onChange={(e) => setFormData(f => ({ ...f, electionDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Online Voting</label>
              <select className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.enableOnlineVoting ? 'true' : 'false'}
                onChange={(e) => setFormData(f => ({ ...f, enableOnlineVoting: e.target.value === 'true' }))}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Voting Start Date</label>
              <input type="datetime-local"
                className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.votingStartDate}
                onChange={(e) => setFormData(f => ({ ...f, votingStartDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Voting End Date</label>
              <input type="datetime-local"
                className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.votingEndDate}
                onChange={(e) => setFormData(f => ({ ...f, votingEndDate: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`${confirmAction?.type?.charAt(0).toUpperCase()}${confirmAction?.type?.slice(1).replace(/([A-Z])/g, ' $1')}`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === 'delete' || confirmAction?.type === 'closeVoting' ? 'danger' : 'success'}
              disabled={actionLoading}
              onClick={handleStatusChange}
            >{actionLoading ? 'Processing...' : 'Confirm'}</Button>
          </div>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to {confirmAction?.type?.replace(/([A-Z])/g, ' $1').toLowerCase()} <strong>{confirmAction?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
