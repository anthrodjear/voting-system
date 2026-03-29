'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';

// Mock candidates data
const candidates = [
  {
    id: '1',
    name: 'Hon. John Odinga',
    party: 'National Alliance',
    position: 'President',
    county: 'Nairobi',
    status: 'approved' as const,
    submittedAt: '2027-01-10',
  },
  {
    id: '2',
    name: 'Dr. Sarah Kimani',
    party: 'Democratic Party',
    position: 'President',
    county: 'Mombasa',
    status: 'pending' as const,
    submittedAt: '2027-01-12',
  },
  {
    id: '3',
    name: 'Eng. Peter Mwangi',
    party: 'Jubilee Party',
    position: 'Governor - Nairobi',
    county: 'Nairobi',
    status: 'approved' as const,
    submittedAt: '2027-01-08',
  },
  {
    id: '4',
    name: 'Prof. Grace Atieno',
    party: 'ODM',
    position: 'Governor - Kisumu',
    county: 'Kisumu',
    status: 'approved' as const,
    submittedAt: '2027-01-05',
  },
  {
    id: '5',
    name: 'Mr. David Kosgei',
    party: 'KANU',
    position: 'Governor - Nakuru',
    county: 'Nakuru',
    status: 'rejected' as const,
    submittedAt: '2027-01-11',
  },
  {
    id: '6',
    name: 'Hon. Mary Njeri',
    party: 'Wiper Party',
    position: 'Governor - Mombasa',
    county: 'Mombasa',
    status: 'pending' as const,
    submittedAt: '2027-01-13',
  },
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<typeof candidates[0] | null>(null);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.party.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleApprove = (candidate: typeof candidates[0]) => {
    setSelectedCandidate(candidate);
    setShowApproveModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Candidates</h1>
          <p className="text-neutral-500">Manage candidate applications and approvals</p>
        </div>
        <Button>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Approved</p>
            <p className="text-2xl font-bold text-neutral-900">
              {candidates.filter(c => c.status === 'approved').length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Pending</p>
            <p className="text-2xl font-bold text-neutral-900">
              {candidates.filter(c => c.status === 'pending').length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-error-light">
            <XCircleIcon className="w-8 h-8 text-error" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Rejected</p>
            <p className="text-2xl font-bold text-neutral-900">
              {candidates.filter(c => c.status === 'rejected').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
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
          <select
            className="h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Candidate</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Party</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Position</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">County</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Submitted</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                        <span className="text-neutral-600 font-semibold">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-neutral-900">{candidate.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{candidate.party}</td>
                  <td className="px-6 py-4 text-neutral-600">{candidate.position}</td>
                  <td className="px-6 py-4 text-neutral-600">{candidate.county}</td>
                  <td className="px-6 py-4">{getStatusBadge(candidate.status)}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {new Date(candidate.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {candidate.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleApprove(candidate)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger">
                          Reject
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Candidate"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => setShowApproveModal(false)}>
              Approve Candidate
            </Button>
          </div>
        }
      >
        <p className="text-neutral-600">
          Are you sure you want to approve <strong>{selectedCandidate?.name}</strong> as a candidate for <strong>{selectedCandidate?.position}</strong>?
        </p>
      </Modal>
    </div>
  );
}
