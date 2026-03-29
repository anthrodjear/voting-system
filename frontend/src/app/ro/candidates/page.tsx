'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';

// Mock candidates data for Nairobi County
const candidates = [
  {
    id: '1',
    name: 'Hon. John Odinga',
    party: 'National Alliance',
    position: 'Governor',
    status: 'approved' as const,
    submittedAt: '2027-01-10',
  },
  {
    id: '2',
    name: 'Dr. Sarah Kimani',
    party: 'Democratic Party',
    position: 'Governor',
    status: 'pending' as const,
    submittedAt: '2027-01-12',
  },
  {
    id: '3',
    name: 'Eng. Peter Mwangi',
    party: 'Jubilee Party',
    position: 'Governor',
    status: 'approved' as const,
    submittedAt: '2027-01-08',
  },
  {
    id: '4',
    name: 'Ms. Grace Atieno',
    party: 'ODM',
    position: 'Women Representative',
    status: 'approved' as const,
    submittedAt: '2027-01-05',
  },
  {
    id: '5',
    name: 'Mr. David Kosgei',
    party: 'KANU',
    position: 'Governor',
    status: 'pending' as const,
    submittedAt: '2027-01-11',
  },
  {
    id: '6',
    name: 'Hon. Mary Njeri',
    party: 'Wiper Party',
    position: 'Senator',
    status: 'approved' as const,
    submittedAt: '2027-01-09',
  },
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleViewDetails = (candidate: typeof candidates[0]) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Candidates</h1>
        <p className="text-neutral-500">Manage candidate applications for Nairobi County</p>
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
          <div className="p-3 rounded-xl bg-ro-50">
            <CheckCircleIcon className="w-8 h-8 text-ro-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-bold text-neutral-900">{candidates.length}</p>
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

      {/* Candidates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-neutral-600">
                    {candidate.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{candidate.name}</h3>
                  <p className="text-sm text-neutral-500">{candidate.party}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <Badge variant="info">{candidate.position}</Badge>
              {getStatusBadge(candidate.status)}
            </div>

            <p className="text-xs text-neutral-400 mb-4">
              Submitted: {formatDate(candidate.submittedAt)}
            </p>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleViewDetails(candidate)}
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                View
              </Button>
              {candidate.status === 'pending' && (
                <>
                  <Button size="sm" variant="success">
                    Approve
                  </Button>
                  <Button size="sm" variant="danger">
                    Reject
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Candidate Details"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
            {selectedCandidate?.status === 'pending' && (
              <>
                <Button variant="danger" onClick={() => setShowDetailsModal(false)}>
                  Reject
                </Button>
                <Button variant="success" onClick={() => setShowDetailsModal(false)}>
                  Approve
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-3xl font-semibold text-neutral-600">
                  {selectedCandidate.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">{selectedCandidate.name}</h3>
                <p className="text-neutral-500">{selectedCandidate.party}</p>
                {getStatusBadge(selectedCandidate.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Position</p>
                <p className="font-semibold text-neutral-900">{selectedCandidate.position}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Submission Date</p>
                <p className="font-semibold text-neutral-900">{formatDate(selectedCandidate.submittedAt)}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Candidate Statement</h4>
              <p className="text-neutral-600">
                This is where the candidate's statement or bio would appear. It would contain
                information about their background, qualifications, and policy positions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-2">Documents</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Nomination Certificate</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Party Endorsement</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">ID Document</span>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
