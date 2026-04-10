'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import roService from '@/services/ro';

export default function VotersPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  
  const [voters, setVoters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadVoters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roService.getCountyVoters({
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        search: searchQuery || undefined,
      });
      setVoters(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load voters');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadVoters();
  }, [loadVoters]);

  const handleVerify = async (voterId: string) => {
    setActionLoading(voterId);
    try {
      await roService.verifyVoter(voterId);
      await loadVoters();
      setShowDetailsModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify voter');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (voterId: string) => {
    setActionLoading(voterId);
    try {
      await roService.rejectVoter(voterId, 'Rejected by Returning Officer');
      await loadVoters();
      setShowDetailsModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to reject voter');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVoters = voters.filter(voter => {
    const fullName = `${voter.firstName} ${voter.lastName}`;
    const matchesSearch = !searchQuery || 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.nationalId?.includes(searchQuery);
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'pending':
      case 'pending_biometrics':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleViewDetails = (voter: any) => {
    setSelectedVoter(voter);
    setShowDetailsModal(true);
  };

  const stats = {
    verified: voters.filter(v => v.status === 'verified').length,
    pending: voters.filter(v => v.status === 'pending' || v.status === 'pending_biometrics').length,
    rejected: voters.filter(v => v.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Voters</h1>
        <p className="text-neutral-500">Manage voter registrations in your county</p>
      </div>

      {error && (
        <div className="bg-error-light border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Verified</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.verified}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Pending</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.pending}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-error-light">
            <XCircleIcon className="w-8 h-8 text-error" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Rejected</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.rejected}</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or National ID..."
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ro-500" />
          </div>
        ) : filteredVoters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No voters found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">National ID</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Registered</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredVoters.map((voter) => (
                  <tr key={voter.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      {voter.firstName} {voter.lastName}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">{voter.nationalId}</td>
                    <td className="px-6 py-4 text-neutral-600">
                      {voter.constituencyName}, {voter.wardName}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(voter.status)}</td>
                    <td className="px-6 py-4 text-neutral-600">
                      {voter.registeredAt ? formatDate(voter.registeredAt) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(voter)}>
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        {(voter.status === 'pending' || voter.status === 'pending_biometrics') && (
                          <>
                            <Button 
                              size="sm" 
                              variant="success"
                              onClick={() => handleVerify(voter.id)}
                              disabled={actionLoading === voter.id}
                            >
                              {actionLoading === voter.id ? '...' : 'Verify'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger"
                              onClick={() => handleReject(voter.id)}
                              disabled={actionLoading === voter.id}
                            >
                              {actionLoading === voter.id ? '...' : 'Reject'}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Voter Details"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedVoter && (selectedVoter.status === 'pending' || selectedVoter.status === 'pending_biometrics') && (
              <>
                <Button 
                  variant="danger" 
                  onClick={() => handleReject(selectedVoter.id)}
                  disabled={actionLoading === selectedVoter.id}
                >
                  Reject
                </Button>
                <Button 
                  variant="success" 
                  onClick={() => handleVerify(selectedVoter.id)}
                  disabled={actionLoading === selectedVoter.id}
                >
                  Verify
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedVoter && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-neutral-600">
                  {selectedVoter.firstName?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {selectedVoter.firstName} {selectedVoter.lastName}
                </h3>
                {getStatusBadge(selectedVoter.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">National ID</p>
                <p className="font-medium">{selectedVoter.nationalId}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">County</p>
                <p className="font-medium">{selectedVoter.countyName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Constituency</p>
                <p className="font-medium">{selectedVoter.constituencyName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Ward</p>
                <p className="font-medium">{selectedVoter.wardName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Registration Date</p>
                <p className="font-medium">
                  {selectedVoter.registeredAt ? formatDate(selectedVoter.registeredAt) : '-'}
                </p>
              </div>
              {selectedVoter.verifiedAt && (
                <div>
                  <p className="text-sm text-neutral-500">Verified Date</p>
                  <p className="font-medium">{formatDate(selectedVoter.verifiedAt)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
