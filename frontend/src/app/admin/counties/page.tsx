'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Input, Progress, Button, Modal } from '@/components/ui';
import adminService from '@/services/admin';

export default function CountiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [counties, setCounties] = useState<any[]>([]);
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set());
  const [expandedConstituencies, setExpandedConstituencies] = useState<Set<string>>(new Set());
  const [constituencyMap, setConstituencyMap] = useState<Record<string, any[]>>({});
  const [wardMap, setWardMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'constituency' | 'ward'>('constituency');
  const [modalAction, setModalAction] = useState<'create' | 'edit'>('create');
  const [modalParentId, setModalParentId] = useState<string>('');
  const [modalParentName, setModalParentName] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [modalLoading, setModalLoading] = useState(false);

  const loadCounties = useCallback(async () => {
    try {
      const data = await adminService.getCounties();
      setCounties(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load counties');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConstituencies = useCallback(async (countyId: string) => {
    try {
      const data = await adminService.getConstituencies(countyId);
      setConstituencyMap(prev => ({ ...prev, [countyId]: data }));
    } catch (err: any) {
      console.error('Failed to load constituencies:', err);
    }
  }, []);

  const loadWards = useCallback(async (constituencyId: string) => {
    try {
      const data = await adminService.getWards(constituencyId);
      setWardMap(prev => ({ ...prev, [constituencyId]: data }));
    } catch (err: any) {
      console.error('Failed to load wards:', err);
    }
  }, []);

  useEffect(() => {
    loadCounties();
  }, [loadCounties]);

  const toggleCounty = async (county: any) => {
    const newExpanded = new Set(expandedCounties);
    if (newExpanded.has(county.id)) {
      newExpanded.delete(county.id);
    } else {
      newExpanded.add(county.id);
      if (!constituencyMap[county.id]) {
        await loadConstituencies(county.id);
      }
    }
    setExpandedCounties(newExpanded);
  };

  const toggleConstituency = async (constituencyId: string) => {
    const newExpanded = new Set(expandedConstituencies);
    if (newExpanded.has(constituencyId)) {
      newExpanded.delete(constituencyId);
    } else {
      newExpanded.add(constituencyId);
      if (!wardMap[constituencyId]) {
        await loadWards(constituencyId);
      }
    }
    setExpandedConstituencies(newExpanded);
  };

  const openCreateModal = (type: 'constituency' | 'ward', parentId: string, parentName: string) => {
    setModalType(type);
    setModalAction('create');
    setModalParentId(parentId);
    setModalParentName(parentName);
    setFormData({ name: '', code: '' });
    setShowModal(true);
  };

  const openEditModal = (type: 'constituency' | 'ward', item: any) => {
    setModalType(type);
    setModalAction('edit');
    setModalParentId(item.id);
    setModalParentName(item.name);
    setFormData({ name: item.name, code: item.code || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    setModalLoading(true);
    try {
      if (modalType === 'constituency') {
        if (modalAction === 'create') {
          await adminService.createConstituency({
            constituencyCode: formData.code,
            constituencyName: formData.name,
            countyId: modalParentId,
          });
        } else {
          await adminService.updateConstituency(modalParentId, { constituencyName: formData.name });
        }
        await loadConstituencies(modalParentId);
      } else {
        if (modalAction === 'create') {
          await adminService.createWard({
            wardCode: formData.code,
            wardName: formData.name,
            constituencyId: modalParentId,
          });
        } else {
          await adminService.updateWard(modalParentId, { wardName: formData.name });
        }
        await loadWards(modalParentId);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type: 'constituency' | 'ward', id: string, parentCountyId?: string, parentConstituencyId?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'constituency') {
        await adminService.deleteConstituency(id);
        if (parentCountyId) await loadConstituencies(parentCountyId);
      } else {
        await adminService.deleteWard(id);
        if (parentConstituencyId) await loadWards(parentConstituencyId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredCounties = counties.filter(county =>
    county.countyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVoters = counties.reduce((sum, c) => sum + (c.voterCount || 0), 0);
  const assignedCounties = counties.filter(c => c.roAssigned).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Counties & Constituencies</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Manage counties, constituencies, and wards</p>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/30">
            <MapPinIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Counties</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{counties.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-success-light dark:bg-success-900/20">
            <UsersIcon className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">RO Assigned</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{assignedCounties}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-admin-50 dark:bg-admin-900/30">
            <MapPinIcon className="w-8 h-8 text-admin-500" />
          </div>
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Voters</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalVoters.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search counties..."
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <ArrowPathIcon className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* County Tree */}
      <div className="space-y-3">
        {filteredCounties.map((county) => {
          const isExpanded = expandedCounties.has(county.id);
          const constituencies = constituencyMap[county.id] || [];
          
          return (
            <Card key={county.id} className="overflow-hidden">
              {/* County Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
                onClick={() => toggleCounty(county)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{county.countyName}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Code: {county.countyCode} • {county.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {(county.voterCount || 0).toLocaleString()} voters
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {constituencies.length} constituencies
                    </p>
                  </div>
                  {county.roAssigned ? (
                    <Badge variant="success"><CheckCircleIcon className="w-3 h-3 mr-1" />RO</Badge>
                  ) : (
                    <Badge variant="warning"><ExclamationCircleIcon className="w-3 h-3 mr-1" />No RO</Badge>
                  )}
                </div>
              </div>

              {/* Constituencies */}
              {isExpanded && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                  <div className="p-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Constituencies ({constituencies.length})</h4>
                    <Button size="sm" variant="secondary" onClick={() => openCreateModal('constituency', county.id, county.countyName)}>
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Constituency
                    </Button>
                  </div>
                  <div className="space-y-1 px-3 pb-3">
                    {constituencies.length === 0 ? (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No constituencies found</p>
                    ) : (
                      constituencies.map((constituency: any) => {
                        const isConstituencyExpanded = expandedConstituencies.has(constituency.id);
                        const wards = wardMap[constituency.id] || [];
                        
                        return (
                          <div key={constituency.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            {/* Constituency Header */}
                            <div className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleConstituency(constituency.id)}
                                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                                >
                                  {isConstituencyExpanded ? (
                                    <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
                                  ) : (
                                    <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
                                  )}
                                </button>
                                <div>
                                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{constituency.constituencyName}</p>
                                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Code: {constituency.constituencyCode}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-neutral-500 dark:text-neutral-400 mr-2">{constituency.wardCount || 0} wards</span>
                                <button
                                  onClick={() => openEditModal('constituency', { id: constituency.id, name: constituency.constituencyName, code: constituency.constituencyCode })}
                                  className="p-1.5 text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                                  title="Edit"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('constituency', constituency.id, county.id)}
                                  className="p-1.5 text-neutral-400 hover:text-error hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Wards */}
                            {isConstituencyExpanded && (
                              <div className="border-t border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
                                <div className="p-2 flex items-center justify-between">
                                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Wards ({wards.length})</span>
                                  <button
                                    onClick={() => openCreateModal('ward', constituency.id, constituency.constituencyName)}
                                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                  >
                                    <PlusIcon className="w-3 h-3" />
                                    Add Ward
                                  </button>
                                </div>
                                <div className="px-2 pb-2 space-y-1">
                                  {wards.length === 0 ? (
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 py-2 text-center">No wards</p>
                                  ) : (
                                    wards.map((ward: any) => (
                                      <div key={ward.id} className="flex items-center justify-between p-2 bg-white dark:bg-neutral-800 rounded border border-neutral-100 dark:border-neutral-700">
                                        <div>
                                          <p className="text-sm text-neutral-900 dark:text-neutral-100">{ward.wardName}</p>
                                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Code: {ward.wardCode}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => openEditModal('ward', { id: ward.id, name: ward.wardName, code: ward.wardCode })}
                                            className="p-1 text-neutral-400 hover:text-primary-500 rounded"
                                            title="Edit"
                                          >
                                            <PencilIcon className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDelete('ward', ward.id, undefined, constituency.id)}
                                            className="p-1 text-neutral-400 hover:text-error rounded"
                                            title="Delete"
                                          >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${modalAction === 'create' ? 'Add' : 'Edit'} ${modalType === 'constituency' ? 'Constituency' : 'Ward'}`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button disabled={modalLoading || !formData.name} onClick={handleSave}>
              {modalLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {modalAction === 'create' ? 'Adding' : 'Editing'} {modalType} in{' '}
            <strong className="text-neutral-900 dark:text-neutral-100">{modalParentName}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              {modalType === 'constituency' ? 'Constituency' : 'Ward'} Name
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.name}
              onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder={`Enter ${modalType} name`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Code (optional)
            </label>
            <input
              type="text"
              className="w-full h-11 px-4 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:border-primary-500"
              value={formData.code}
              onChange={(e) => setFormData(f => ({ ...f, code: e.target.value }))}
              placeholder={`e.g., ${modalType === 'constituency' ? '001' : '001001'}`}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
