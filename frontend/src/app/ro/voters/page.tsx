'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';

// Mock voters data
const voters = [
  {
    id: '1',
    name: 'John Doe',
    nationalId: '12345678',
    phone: '+254 700 000 001',
    county: 'Nairobi',
    constituency: 'Kasarani',
    ward: 'Mwiki',
    status: 'verified' as const,
    registeredAt: '2027-01-10',
  },
  {
    id: '2',
    name: 'Jane Smith',
    nationalId: '23456789',
    phone: '+254 700 000 002',
    county: 'Nairobi',
    constituency: 'Kasarani',
    ward: 'Kasarani',
    status: 'pending' as const,
    registeredAt: '2027-01-12',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    nationalId: '34567890',
    phone: '+254 700 000 003',
    county: 'Nairobi',
    constituency: 'Ruaraka',
    ward: 'Utalii',
    status: 'verified' as const,
    registeredAt: '2027-01-08',
  },
  {
    id: '4',
    name: 'Mary Williams',
    nationalId: '45678901',
    phone: '+254 700 000 004',
    county: 'Nairobi',
    constituency: 'Kasarani',
    ward: 'Mwiki',
    status: 'rejected' as const,
    registeredAt: '2027-01-11',
  },
];

export default function VotersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVoter, setSelectedVoter] = useState<typeof voters[0] | null>(null);

  const filteredVoters = voters.filter(voter => {
    const matchesSearch = voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voter.nationalId.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || voter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleViewDetails = (voter: typeof voters[0]) => {
    setSelectedVoter(voter);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Voters</h1>
        <p className="text-neutral-500">Manage voter registrations in Nairobi County</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Verified</p>
            <p className="text-2xl font-bold text-neutral-900">
              {voters.filter(v => v.status === 'verified').length}
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
              {voters.filter(v => v.status === 'pending').length}
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
              {voters.filter(v => v.status === 'rejected').length}
            </p>
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
                  <td className="px-6 py-4 font-medium text-neutral-900">{voter.name}</td>
                  <td className="px-6 py-4 text-neutral-600">{voter.nationalId}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {voter.constituency}, {voter.ward}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(voter.status)}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {formatDate(voter.registeredAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleViewDetails(voter)}>
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      {voter.status === 'pending' && (
                        <>
                          <Button size="sm" variant="success">
                            Verify
                          </Button>
                          <Button size="sm" variant="danger">
                            Reject
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
            {selectedVoter?.status === 'pending' && (
              <>
                <Button variant="danger" onClick={() => setShowDetailsModal(false)}>
                  Reject
                </Button>
                <Button variant="success" onClick={() => setShowDetailsModal(false)}>
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
                  {selectedVoter.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">{selectedVoter.name}</h3>
                {getStatusBadge(selectedVoter.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">National ID</p>
                <p className="font-medium">{selectedVoter.nationalId}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Phone</p>
                <p className="font-medium">{selectedVoter.phone}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">County</p>
                <p className="font-medium">{selectedVoter.county}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Constituency</p>
                <p className="font-medium">{selectedVoter.constituency}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Ward</p>
                <p className="font-medium">{selectedVoter.ward}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Registration Date</p>
                <p className="font-medium">{formatDate(selectedVoter.registeredAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
