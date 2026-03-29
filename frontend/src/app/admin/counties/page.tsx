'use client';

import { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Badge, Input, Progress } from '@/components/ui';

// Mock county data
const counties = [
  { code: '001', name: 'Mombasa', voters: 456789, roAssigned: true, status: 'active' },
  { code: '002', name: 'Kwale', voters: 234567, roAssigned: true, status: 'active' },
  { code: '003', name: 'Kilifi', voters: 345678, roAssigned: true, status: 'active' },
  { code: '004', name: 'Tana River', voters: 123456, roAssigned: false, status: 'pending' },
  { code: '005', name: 'Lamu', voters: 98765, roAssigned: true, status: 'active' },
  { code: '006', name: 'Taita Taveta', voters: 156789, roAssigned: true, status: 'active' },
  { code: '007', name: 'Garissa', voters: 234567, roAssigned: true, status: 'active' },
  { code: '008', name: 'Wajir', voters: 198765, roAssigned: false, status: 'pending' },
  { code: '009', name: 'Mandera', voters: 267890, roAssigned: true, status: 'active' },
  { code: '010', name: 'Marsabit', voters: 145678, roAssigned: true, status: 'active' },
];

export default function CountiesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCounties = counties.filter(county =>
    county.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVoters = counties.reduce((sum, c) => sum + c.voters, 0);
  const assignedCounties = counties.filter(c => c.roAssigned).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Counties</h1>
        <p className="text-neutral-500">Manage electoral counties and their configurations</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50">
            <MapPinIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Counties</p>
            <p className="text-2xl font-bold text-neutral-900">{counties.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <UsersIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">RO Assigned</p>
            <p className="text-2xl font-bold text-neutral-900">{assignedCounties}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-50">
            <MapPinIcon className="w-8 h-8 text-admin-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total Voters</p>
            <p className="text-2xl font-bold text-neutral-900">{totalVoters.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Search counties..."
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* Counties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCounties.map((county) => (
          <Card key={county.code} variant="interactive" className="hover:shadow-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-neutral-900">{county.name}</h3>
                <p className="text-sm text-neutral-500">Code: {county.code}</p>
              </div>
              {county.roAssigned ? (
                <Badge variant="success">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  RO Assigned
                </Badge>
              ) : (
                <Badge variant="warning">
                  <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Registered Voters</span>
                <span className="font-medium">{county.voters.toLocaleString()}</span>
              </div>
              <Progress 
                value={county.voters} 
                max={500000} 
                variant={county.roAssigned ? 'success' : 'warning'} 
                size="sm"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
