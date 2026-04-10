'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, Input, Modal } from '@/components/ui';
import adminService from '@/services/admin';

const POSITION_OPTIONS = [
  { value: 'president', label: 'President', requiresCounty: false },
  { value: 'governor', label: 'Governor', requiresCounty: true },
  { value: 'senator', label: 'Senator', requiresCounty: true },
  { value: 'mp', label: 'Member of Parliament (MP)', requiresCounty: false },
  { value: 'mca', label: 'Member of County Assembly (MCA)', requiresCounty: true },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [counties, setCounties] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editCandidate, setEditCandidate] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', middleName: '', position: 'governor',
    countyId: '', countyName: '', constituencyId: '', wardId: '',
    partyName: '', partyAbbreviation: '', partyColor: '#4F46E5', isIndependent: false,
    dateOfBirth: '', photo: '', manifesto: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Confirm action
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject' | 'delete';
    id: string; name: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [result, countiesData] = await Promise.all([
        adminService.getCandidates({
          search: searchQuery || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          position: positionFilter !== 'all' ? positionFilter : undefined,
          page: pagination.page, limit: pagination.limit,
        }),
        adminService.getCounties(),
      ]);
      setCandidates(result.candidates || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0 });
      setCounties(countiesData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, positionFilter, pagination.page, pagination.limit]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (formData.countyId) {
      adminService.getConstituencies(formData.countyId)
        .then(data => setConstituencies(data || []))
        .catch(() => setConstituencies([]));
    }
  }, [formData.countyId]);

  useEffect(() => {
    if (formData.constituencyId) {
      adminService.getWards(formData.constituencyId)
        .then(data => setWards(data || []))
        .catch(() => setWards([]));
    }
  }, [formData.constituencyId]);

  const openCreateModal = () => {
    setEditCandidate(null);
    setPhotoFile(null);
    setFormData({
      firstName: '', lastName: '', middleName: '', position: 'governor',
      countyId: '', countyName: '', constituencyId: '', wardId: '',
      partyName: '', partyAbbreviation: '', partyColor: '#4F46E5', isIndependent: false,
      dateOfBirth: '', photo: '', manifesto: '',
    });
    setShowModal(true);
  };

  const openEditModal = (candidate: any) => {
    setEditCandidate(candidate);
    setPhotoFile(null);
    setFormData({
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      middleName: candidate.middleName || '',
      position: candidate.position || 'governor',
      countyId: candidate.countyId || '',
      countyName: candidate.countyName || '',
      constituencyId: candidate.constituencyId || '',
      wardId: candidate.wardId || '',
      partyName: candidate.partyName || '',
      partyAbbreviation: candidate.partyAbbreviation || '',
      partyColor: candidate.partyColor || '#4F46E5',
      isIndependent: candidate.isIndependent || false,
      dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toISOString().split('T')[0] : '',
      photo: candidate.photo || '',
      manifesto: candidate.manifesto || '',
    });
    setShowModal(true);
  };

  const uploadPhotoForCandidate = async (candidateId: string, file: File): Promise<string | null> => {
    setPhotoUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}/upload/candidates/${candidateId}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload,
      });
      
      if (!response.ok) throw new Error('Failed to upload photo');
      
      const result = await response.json();
      return result.data.url;
    } catch (err: any) {
      console.error('Photo upload error:', err);
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.position) {
      setError('First name, last name, and position are required');
      return;
    }

    const posOption = POSITION_OPTIONS.find(p => p.value === formData.position);
    if (posOption?.requiresCounty && !formData.countyId) {
      setError(`${posOption.label} requires a county to be selected`);
      return;
    }

    setModalLoading(true);
    try {
      if (editCandidate) {
        // Update existing candidate
        await adminService.updateCandidate(editCandidate.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || undefined,
          partyName: formData.partyName || undefined,
          partyAbbreviation: formData.partyAbbreviation || undefined,
          photo: formData.photo || undefined,
          manifesto: formData.manifesto || undefined,
        });

        // If a new photo was uploaded during edit, update the photo URL
        if (photoFile && photoUploading) {
          // Photo was already uploaded via the file input onChange handler
        }
      } else {
        // Create new candidate
        const payload: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          partyName: formData.partyName,
          partyAbbreviation: formData.partyAbbreviation,
          partyColor: formData.partyColor,
          isIndependent: formData.isIndependent,
          manifesto: formData.manifesto,
        };

        if (formData.middleName) payload.middleName = formData.middleName;
        if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
        // Don't send base64 photo - we'll upload it separately
        if (formData.photo && !formData.photo.startsWith('data:')) {
          payload.photo = formData.photo;
        }

        if (posOption?.requiresCounty) {
          payload.countyId = formData.countyId;
          payload.countyName = formData.countyName;
          if (formData.position === 'mca' && formData.wardId) payload.wardId = formData.wardId;
          if (formData.position === 'mp' && formData.constituencyId) payload.constituencyId = formData.constituencyId;
        }

        await adminService.createCandidate(payload);

        // Upload photo after creation if there's a file
        if (photoFile) {
          // Get the newly created candidate
          const candidatesResult = await adminService.getCandidates({ page: 1, limit: 1 });
          const newCandidate = candidatesResult.candidates?.[0];
          
          if (newCandidate) {
            const photoUrl = await uploadPhotoForCandidate(newCandidate.id, photoFile);
            if (photoUrl) {
              await adminService.updateCandidate(newCandidate.id, { photo: photoUrl });
            }
          }
        }
      }

      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(f => ({ ...f, photo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
    setPhotoFile(file);

    // If editing an existing candidate, upload immediately
    if (editCandidate?.id) {
      const photoUrl = await uploadPhotoForCandidate(editCandidate.id, file);
      if (photoUrl) {
        setFormData(f => ({ ...f, photo: photoUrl }));
        await adminService.updateCandidate(editCandidate.id, { photo: photoUrl });
        await loadData();
      }
    }
  };

  const handleAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.type === 'approve') {
        await adminService.approveCandidate(confirmAction.id);
      } else if (confirmAction.type === 'reject') {
        await adminService.rejectCandidate(confirmAction.id, 'Rejected by admin');
      } else if (confirmAction.type === 'delete') {
        await adminService.deleteCandidate(confirmAction.id);
      }
      await loadData();
      setConfirmAction(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getPositionLabel = (position: string) => {
    const opt = POSITION_OPTIONS.find(p => p.value === position);
    return opt?.label || position;
  };

  const requiresCounty = POSITION_OPTIONS.find(p => p.value === formData.position)?.requiresCounty;

  const getPhotoSrc = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith('data:')) return photo;
    if (photo.startsWith('http')) return photo;
    return `${API_BASE_URL.replace('/v1', '')}${photo}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Candidates</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage candidates for all positions — President to MCA</p>
        </div>
        <Button onClick={openCreateModal}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Candidate
        </Button>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <UserPlusIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{candidates.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Approved</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {candidates.filter(c => c.status === 'approved').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-warning-light dark:bg-warning-900/20">
            <ClockIcon className="w-8 h-8 text-warning" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pending</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {candidates.filter(c => c.status === 'pending').length}
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
          <div className="flex gap-2 flex-wrap">
            <select
              className="h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="all">All Positions</option>
              {POSITION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              className="h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button variant="secondary" onClick={loadData}>
              <ArrowPathIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Candidate</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden md:table-cell">Party</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Position</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden lg:table-cell">County</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                  <th className="text-left px-4 lg:px-6 py-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">Date</th>
                  <th className="px-4 lg:px-6 py-4 text-right text-sm font-semibold text-neutral-700 dark:text-neutral-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neutral-500 dark:text-neutral-400">
                      No candidates found
                    </td>
                  </tr>
                ) : (
                  candidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                            style={candidate.photo ? {} : { backgroundColor: candidate.partyColor || '#4F46E5' }}>
                            {candidate.photo ? (
                              <img src={getPhotoSrc(candidate.photo)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {candidate.firstName?.charAt(0)}{candidate.lastName?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">
                              {candidate.firstName} {candidate.lastName}
                            </span>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{candidate.candidateNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {candidate.partyColor && (
                            <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex-shrink-0" style={{ backgroundColor: candidate.partyColor }} />
                          )}
                          <span>{candidate.partyName || (candidate.isIndependent ? 'Independent' : '-')}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <Badge variant="secondary">{getPositionLabel(candidate.position)}</Badge>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm hidden lg:table-cell">
                        {candidate.countyName || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4">{getStatusBadge(candidate.status)}</td>
                      <td className="px-4 lg:px-6 py-4 text-neutral-600 dark:text-neutral-400 text-sm hidden sm:table-cell">
                        {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {candidate.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" className="hidden sm:flex"
                                onClick={() => setConfirmAction({ type: 'approve', id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}` })}>
                                Approve
                              </Button>
                              <Button size="sm" variant="danger" className="hidden sm:flex"
                                onClick={() => setConfirmAction({ type: 'reject', id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}` })}>
                                Reject
                              </Button>
                            </>
                          )}
                          <button
                            onClick={() => openEditModal(candidate)}
                            className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                            title="Edit"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {candidate.status !== 'approved' && (
                            <button
                              onClick={() => setConfirmAction({ type: 'delete', id: candidate.id, name: `${candidate.firstName} ${candidate.lastName}` })}
                              className="p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editCandidate ? 'Edit Candidate' : 'Add New Candidate'}
        size="lg"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button disabled={modalLoading || photoUploading} onClick={handleSave}>
              {modalLoading ? 'Saving...' : editCandidate ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Position *</label>
            <select
              className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.position}
              onChange={(e) => setFormData(f => ({ ...f, position: e.target.value, countyId: '', countyName: '', constituencyId: '', wardId: '' }))}
            >
              {POSITION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">First Name *</label>
              <input type="text" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.firstName} onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Last Name *</label>
              <input type="text" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.lastName} onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Middle Name</label>
              <input type="text" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.middleName} onChange={(e) => setFormData(f => ({ ...f, middleName: e.target.value }))} />
            </div>
          </div>

          {/* County */}
          {requiresCounty && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">County *</label>
                <select
                  className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                  value={formData.countyId}
                  onChange={(e) => {
                    const county = counties.find(c => c.id === e.target.value);
                    setFormData(f => ({ ...f, countyId: e.target.value, countyName: county?.countyName || '' }));
                  }}
                >
                  <option value="">Select County</option>
                  {counties.map(c => (
                    <option key={c.id} value={c.id}>{c.countyName}</option>
                  ))}
                </select>
              </div>
              {(formData.position === 'mp' || formData.position === 'mca') && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Constituency</label>
                  <select
                    className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                    value={formData.constituencyId}
                    onChange={(e) => setFormData(f => ({ ...f, constituencyId: e.target.value, wardId: '' }))}
                  >
                    <option value="">Select Constituency</option>
                    {constituencies.map(c => (
                      <option key={c.id} value={c.id}>{c.constituencyName}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.position === 'mca' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Ward</label>
                  <select
                    className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                    value={formData.wardId}
                    onChange={(e) => setFormData(f => ({ ...f, wardId: e.target.value }))}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(w => (
                      <option key={w.id} value={w.id}>{w.wardName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Party */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Party Name</label>
              <input type="text" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.partyName} onChange={(e) => setFormData(f => ({ ...f, partyName: e.target.value, partyAbbreviation: e.target.value.slice(0, 3).toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Party Abbreviation</label>
              <input type="text" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
                value={formData.partyAbbreviation} onChange={(e) => setFormData(f => ({ ...f, partyAbbreviation: e.target.value.toUpperCase() }))} maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Party Color</label>
              <div className="flex items-center gap-2">
                <input type="color" className="w-11 h-11 p-1 border border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer"
                  value={formData.partyColor} onChange={(e) => setFormData(f => ({ ...f, partyColor: e.target.value }))} />
                <input type="text" className="flex-1 h-11 px-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500 text-sm font-mono"
                  value={formData.partyColor} onChange={(e) => setFormData(f => ({ ...f, partyColor: e.target.value }))} maxLength={7} />
              </div>
            </div>
          </div>

          {/* Independent toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormData(f => ({ ...f, isIndependent: !f.isIndependent }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${formData.isIndependent ? 'bg-admin-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isIndependent ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-neutral-700 dark:text-neutral-300">Independent Candidate</span>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Candidate Photo</label>
            <div className="flex items-center gap-4">
              {formData.photo && (
                <div className="relative">
                  <img 
                    src={getPhotoSrc(formData.photo)} 
                    alt="Preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-600" 
                  />
                  <button
                    onClick={() => { setFormData(f => ({ ...f, photo: '' })); setPhotoFile(null); }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center text-xs hover:bg-error-dark"
                  >
                    ×
                  </button>
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center h-20 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                {photoUploading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-xs text-neutral-500">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-neutral-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Click to upload photo</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Date of Birth</label>
            <input type="date" className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.dateOfBirth} onChange={(e) => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))} />
          </div>

          {/* Manifesto */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Manifesto</label>
            <textarea className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              rows={3} value={formData.manifesto} onChange={(e) => setFormData(f => ({ ...f, manifesto: e.target.value }))}
              placeholder="Candidate's manifesto..." />
          </div>
        </div>
      </Modal>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={`${confirmAction?.type === 'approve' ? 'Approve' : confirmAction?.type === 'reject' ? 'Reject' : 'Delete'} Candidate`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              variant={confirmAction?.type === 'approve' ? 'success' : 'danger'}
              disabled={actionLoading}
              onClick={handleAction}
            >{actionLoading ? 'Processing...' : confirmAction?.type === 'approve' ? 'Approve' : confirmAction?.type === 'reject' ? 'Reject' : 'Delete'}</Button>
          </div>
        }
      >
        <p className="text-neutral-600 dark:text-neutral-400">
          {confirmAction?.type === 'delete'
            ? `Are you sure you want to delete <strong>${confirmAction?.name}</strong>? This cannot be undone.`
            : `Are you sure you want to ${confirmAction?.type} <strong>${confirmAction?.name}</strong>?`
          }
        </p>
      </Modal>
    </div>
  );
}
