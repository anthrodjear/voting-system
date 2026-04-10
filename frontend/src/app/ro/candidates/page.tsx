'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import roService from '@/services/ro';
import adminService from '@/services/admin';

const POSITIONS = [
  { value: 'Governor', level: 'county', label: 'Governor' },
  { value: 'Senator', level: 'county', label: 'Senator' },
  { value: 'Women Rep', level: 'county', label: 'Women Representative' },
  { value: 'MP', level: 'constituency', label: 'Member of Parliament (MP)' },
  { value: 'MCA', level: 'ward', label: 'Member of County Assembly (MCA)' },
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  // Add candidate form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    position: '',
    partyName: '',
    partyAbbreviation: '',
    isIndependent: false,
    constituencyId: '',
    wardId: '',
  });

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roService.getCountyCandidates();
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load constituencies for the county
  const loadConstituencies = useCallback(async () => {
    try {
      const stats = await roService.getDashboardStats();
      if (stats.assignedCounty?.id) {
        const consts = await adminService.getConstituencies(stats.assignedCounty.id);
        setConstituencies(consts);
      }
    } catch (err: any) {
      console.error('Failed to load constituencies:', err);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
    loadConstituencies();
  }, [loadCandidates, loadConstituencies]);

  // Load wards when constituency changes
  const handleConstituencyChange = async (constituencyId: string) => {
    setFormData(f => ({ ...f, constituencyId, wardId: '' }));
    setWards([]);
    if (constituencyId) {
      try {
        const w = await adminService.getWards(constituencyId);
        setWards(w);
      } catch (err) {
        console.error('Failed to load wards:', err);
      }
    }
  };

  const handleAddCandidate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.position || !formData.partyName) {
      setError('Please fill in all required fields');
      return;
    }

    setAddLoading(true);
    try {
      await roService.createCandidate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || undefined,
        position: formData.position,
        partyName: formData.partyName,
        partyAbbreviation: formData.partyAbbreviation || undefined,
        isIndependent: formData.isIndependent,
        constituencyId: formData.constituencyId || undefined,
        wardId: formData.wardId || undefined,
      });
      setSuccess(`Candidate ${formData.firstName} ${formData.lastName} submitted for approval`);
      setShowAddModal(false);
      setFormData({
        firstName: '', lastName: '', middleName: '', position: '',
        partyName: '', partyAbbreviation: '', isIndependent: false,
        constituencyId: '', wardId: '',
      });
      await loadCandidates();
    } catch (err: any) {
      setError(err.message || 'Failed to create candidate');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const fullName = `${candidate.firstName} ${candidate.lastName}`;
    const matchesSearch = !searchQuery || 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.partyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleViewDetails = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowDetailsModal(true);
  };

  const selectedPosition = POSITIONS.find(p => p.value === formData.position);

  const stats = {
    approved: candidates.filter(c => c.status === 'approved').length,
    pending: candidates.filter(c => c.status === 'pending').length,
    rejected: candidates.filter(c => c.status === 'rejected').length,
    total: candidates.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Candidates</h1>
          <p className="text-neutral-500">Add and manage candidates for your county</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Candidate
        </Button>
      </div>

      {error && (
        <div className="bg-error-light border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="bg-success-light border border-success/20 text-success px-4 py-3 rounded-lg">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light">
            <CheckCircleIcon className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Approved</p>
            <p className="text-xl font-bold text-neutral-900">{stats.approved}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light">
            <ClockIcon className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Pending</p>
            <p className="text-xl font-bold text-neutral-900">{stats.pending}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-error-light">
            <XCircleIcon className="w-6 h-6 text-error" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Rejected</p>
            <p className="text-xl font-bold text-neutral-900">{stats.rejected}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ro-50">
            <UserPlusIcon className="w-6 h-6 text-ro-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-xl font-bold text-neutral-900">{stats.total}</p>
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
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ro-500" />
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card className="text-center py-12">
          <UserPlusIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 mb-2">No candidates found</p>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Your First Candidate
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-neutral-600">
                      {candidate.firstName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-sm text-neutral-500">{candidate.partyName}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <Badge variant="info">{candidate.position}</Badge>
                {getStatusBadge(candidate.status)}
              </div>

              <p className="text-xs text-neutral-400 mb-4">
                Submitted: {candidate.submittedAt ? formatDate(candidate.submittedAt) : '-'}
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
                {candidate.status === 'rejected' && (
                  <span className="text-xs text-error self-center ml-2">
                    Contact admin for details
                  </span>
                )}
                {candidate.status === 'pending' && (
                  <span className="text-xs text-warning self-center ml-2">
                    Awaiting admin review
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Candidate Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Candidate"
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCandidate} disabled={addLoading}>
              {addLoading ? 'Submitting...' : 'Submit Candidate'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-ro-50 border border-ro-200 rounded-lg p-3">
            <p className="text-sm text-ro-700">
              Candidates will be submitted for <strong>admin approval</strong>. 
              They will appear as &quot;Pending&quot; until reviewed.
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                First Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.firstName}
                onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))}
                placeholder="e.g., John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Last Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.lastName}
                onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))}
                placeholder="e.g., Mwangi"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Middle Name
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.middleName}
              onChange={(e) => setFormData(f => ({ ...f, middleName: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Position <span className="text-error">*</span>
            </label>
            <select
              className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.position}
              onChange={(e) => setFormData(f => ({ ...f, position: e.target.value, constituencyId: '', wardId: '' }))}
            >
              <option value="">Select position...</option>
              {POSITIONS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Constituency (for MP) */}
          {selectedPosition?.level === 'constituency' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Constituency <span className="text-error">*</span>
              </label>
              <select
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.constituencyId}
                onChange={(e) => handleConstituencyChange(e.target.value)}
              >
                <option value="">Select constituency...</option>
                {constituencies.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.constituencyName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Ward (for MCA) */}
          {selectedPosition?.level === 'ward' && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Constituency <span className="text-error">*</span>
                </label>
                <select
                  className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                  value={formData.constituencyId}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                >
                  <option value="">Select constituency...</option>
                  {constituencies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.constituencyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Ward <span className="text-error">*</span>
                </label>
                <select
                  className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                  value={formData.wardId}
                  onChange={(e) => setFormData(f => ({ ...f, wardId: e.target.value }))}
                  disabled={!formData.constituencyId}
                >
                  <option value="">
                    {formData.constituencyId ? 'Select ward...' : 'Select constituency first'}
                  </option>
                  {wards.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.wardName}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Party */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Party Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.partyName}
                onChange={(e) => setFormData(f => ({ ...f, partyName: e.target.value }))}
                placeholder="e.g., Jubilee Party"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Party Abbreviation
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.partyAbbreviation}
                onChange={(e) => setFormData(f => ({ ...f, partyAbbreviation: e.target.value.toUpperCase() }))}
                placeholder="e.g., JP"
                maxLength={10}
              />
            </div>
          </div>

          {/* Independent */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-neutral-300 text-ro-500 focus:ring-ro-500"
              checked={formData.isIndependent}
              onChange={(e) => setFormData(f => ({ ...f, isIndependent: e.target.checked }))}
            />
            <span className="text-sm text-neutral-700">Independent candidate</span>
          </label>
        </div>
      </Modal>

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
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                <span className="text-3xl font-semibold text-neutral-600">
                  {selectedCandidate.firstName?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {selectedCandidate.firstName} {selectedCandidate.middleName ? selectedCandidate.middleName + ' ' : ''}{selectedCandidate.lastName}
                </h3>
                <p className="text-neutral-500">{selectedCandidate.partyName}
                  {selectedCandidate.partyAbbreviation && ` (${selectedCandidate.partyAbbreviation})`}
                </p>
                {getStatusBadge(selectedCandidate.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Position</p>
                <p className="font-semibold text-neutral-900">{selectedCandidate.position}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Candidate Number</p>
                <p className="font-semibold text-neutral-900">{selectedCandidate.candidateNumber || '-'}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Party</p>
                <p className="font-semibold text-neutral-900">
                  {selectedCandidate.partyName}
                  {selectedCandidate.partyAbbreviation && ` (${selectedCandidate.partyAbbreviation})`}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-500 mb-1">Submitted</p>
                <p className="font-semibold text-neutral-900">
                  {selectedCandidate.submittedAt ? formatDate(selectedCandidate.submittedAt) : '-'}
                </p>
              </div>
            </div>

            {selectedCandidate.status === 'approved' && selectedCandidate.approvedAt && (
              <div className="p-4 bg-success-light rounded-lg">
                <p className="text-sm text-success font-medium">
                  Approved on {formatDate(selectedCandidate.approvedAt)}
                </p>
              </div>
            )}

            {selectedCandidate.status === 'pending' && (
              <div className="p-4 bg-warning-light rounded-lg">
                <p className="text-sm text-warning font-medium">
                  This candidate is awaiting admin review. You will be notified once a decision is made.
                </p>
              </div>
            )}

            {selectedCandidate.status === 'rejected' && (
              <div className="p-4 bg-error-light rounded-lg">
                <p className="text-sm text-error font-medium">
                  This candidate was rejected by the admin. Contact the admin office for more details.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
