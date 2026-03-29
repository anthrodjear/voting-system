'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';

// Mock data
const returningOfficers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@iebc.go.ke',
    county: 'Nairobi',
    constituency: 'Kasarani',
    status: 'approved' as const,
    assignedAt: '2027-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@iebc.go.ke',
    county: 'Mombasa',
    constituency: 'Kisauni',
    status: 'pending' as const,
    assignedAt: null,
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@iebc.go.ke',
    county: 'Kisumu',
    constituency: 'Kisumu Central',
    status: 'approved' as const,
    assignedAt: '2027-01-10',
  },
  {
    id: '4',
    name: 'Mary Williams',
    email: 'mary.w@iebc.go.ke',
    county: 'Nakuru',
    constituency: 'Nakuru Town',
    status: 'suspended' as const,
    assignedAt: '2027-01-05',
  },
];

export default function ReturningOfficersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredROs = returningOfficers.filter(ro => {
    const matchesSearch = ro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ro.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ro.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'suspended':
        return <Badge variant="error">Suspended</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Returning Officers</h1>
          <p className="text-neutral-500">Manage Returning Officers across all counties</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Returning Officer
        </Button>
      </div>

      {/* Filters */}
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
              className="h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">County</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Constituency</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-700">Assigned</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredROs.map((ro) => (
                <tr key={ro.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-neutral-900">{ro.name}</p>
                      <p className="text-sm text-neutral-500">{ro.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{ro.county}</td>
                  <td className="px-6 py-4 text-neutral-600">{ro.constituency}</td>
                  <td className="px-6 py-4">{getStatusBadge(ro.status)}</td>
                  <td className="px-6 py-4 text-neutral-600">
                    {ro.assignedAt ? new Date(ro.assignedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-neutral-100 rounded-lg">
                      <EllipsisVerticalIcon className="w-5 h-5 text-neutral-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Returning Officer"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddModal(false)}>
              Add Officer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" />
          <Input label="Email" type="email" placeholder="email@iebc.go.ke" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">County</label>
            <select className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500">
              <option>Select County</option>
              <option>Nairobi</option>
              <option>Mombasa</option>
              <option>Kisumu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Constituency</label>
            <select className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500">
              <option>Select Constituency</option>
              <option>Kasarani</option>
              <option>Kisauni</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
