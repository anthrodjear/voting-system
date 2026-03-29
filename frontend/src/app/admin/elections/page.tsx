'use client';

import { useState } from 'react';
import { 
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  PlayIcon,
  StopIcon,
  PencilIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';

// Mock elections data
const elections = [
  {
    id: '1',
    name: 'General Election 2027',
    type: 'general' as const,
    status: 'voting_open' as const,
    startDate: '2027-08-08',
    endDate: '2027-08-09',
    positions: 5,
    counties: 47,
    registeredVoters: 22456789,
  },
  {
    id: '2',
    name: 'Nairobi Gubernatorial By-election',
    type: 'by-election' as const,
    status: 'registration_open' as const,
    startDate: '2027-04-15',
    endDate: '2027-04-16',
    positions: 1,
    counties: 1,
    registeredVoters: 2345678,
  },
  {
    id: '3',
    name: 'Party Primaries 2027',
    type: 'primary' as const,
    status: 'draft' as const,
    startDate: '2027-06-01',
    endDate: '2027-06-15',
    positions: 3,
    counties: 47,
    registeredVoters: 0,
  },
  {
    id: '4',
    name: 'County Assembly By-election - Baringo',
    type: 'by-election' as const,
    status: 'published' as const,
    startDate: '2027-05-20',
    endDate: '2027-05-21',
    positions: 1,
    counties: 1,
    registeredVoters: 345678,
  },
  {
    id: '5',
    name: 'Previous General Election 2022',
    type: 'general' as const,
    status: 'voting_closed' as const,
    startDate: '2022-08-09',
    endDate: '2022-08-10',
    positions: 6,
    counties: 47,
    registeredVoters: 21045678,
  },
];

export default function ElectionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'published':
        return <Badge variant="info">Published</Badge>;
      case 'registration_open':
        return <Badge variant="warning">Registration Open</Badge>;
      case 'voting_open':
        return <Badge variant="success">Voting Open</Badge>;
      case 'voting_closed':
        return <Badge variant="error">Voting Closed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'general':
        return <Badge variant="primary">General</Badge>;
      case 'by-election':
        return <Badge variant="info">By-election</Badge>;
      case 'primary':
        return <Badge variant="secondary">Primary</Badge>;
      default:
        return <Badge variant="neutral">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Elections</h1>
          <p className="text-neutral-500">Create and manage elections across Kenya</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Election
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <CalendarIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Elections</p>
            <p className="text-2xl font-bold text-neutral-900">{elections.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <PlayIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Active</p>
            <p className="text-2xl font-bold text-neutral-900">
              {elections.filter(e => e.status === 'voting_open').length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <CalendarIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Upcoming</p>
            <p className="text-2xl font-bold text-neutral-900">
              {elections.filter(e => ['published', 'registration_open'].includes(e.status)).length}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-neutral-100">
            <CalendarIcon className="w-8 h-8 text-neutral-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Draft</p>
            <p className="text-2xl font-bold text-neutral-900">
              {elections.filter(e => e.status === 'draft').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Elections List */}
      <div className="space-y-4">
        {elections.map((election) => (
          <Card key={election.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-neutral-900">{election.name}</h3>
                  {getTypeBadge(election.type)}
                  {getStatusBadge(election.status)}
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(election.startDate)} - {formatDate(election.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{election.counties} {election.counties === 1 ? 'County' : 'Counties'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    <span>{election.registeredVoters.toLocaleString()} Registered</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {election.status === 'draft' && (
                  <>
                    <Button variant="secondary" size="sm">
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm">
                      Publish
                    </Button>
                  </>
                )}
                {election.status === 'published' && (
                  <>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                    <Button variant="success" size="sm">
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Start Registration
                    </Button>
                  </>
                )}
                {election.status === 'registration_open' && (
                  <>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                    <Button variant="success" size="sm">
                      <PlayIcon className="w-4 h-4 mr-1" />
                      Open Voting
                    </Button>
                  </>
                )}
                {election.status === 'voting_open' && (
                  <>
                    <Button variant="secondary" size="sm">
                      Live Results
                    </Button>
                    <Button variant="danger" size="sm">
                      <StopIcon className="w-4 h-4 mr-1" />
                      Close Voting
                    </Button>
                  </>
                )}
                {election.status === 'voting_closed' && (
                  <>
                    <Button variant="secondary" size="sm">
                      View Results
                    </Button>
                    <Button size="sm">
                      Publish Results
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Election"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowCreateModal(false)}>
              Create Election
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Election Name</label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="e.g., General Election 2027"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Election Type</label>
            <select className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500">
              <option>General Election</option>
              <option>By-election</option>
              <option>Primary Election</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3}
              placeholder="Brief description of the election..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
