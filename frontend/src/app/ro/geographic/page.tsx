'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { Card, Badge, Input, Button, Modal } from '@/components/ui';
import adminService from '@/services/admin';
import roService from '@/services/ro';

export default function ROGeographicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [county, setCounty] = useState<any>(null);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [wardMap, setWardMap] = useState<Record<string, any[]>>({});
  const [expandedConstituencies, setExpandedConstituencies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'constituency' | 'ward'>('constituency');
  const [modalAction, setModalAction] = useState<'create' | 'rename'>('create');
  const [modalParentId, setModalParentId] = useState<string>('');
  const [modalParentName, setModalParentName] = useState<string>('');
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [modalLoading, setModalLoading] = useState(false);

  // Load RO's assigned county
  useEffect(() => {
    async function loadCounty() {
      try {
        // First get the RO's assigned county from dashboard stats
        const stats = await roService.getDashboardStats();
        const assignedCountyId = stats.assignedCounty?.id;
        
        const allCounties = await adminService.getCounties();
        
        if (assignedCountyId) {
          // Find the RO's assigned county
          const roCounty = allCounties.find((c: any) => c.id === assignedCountyId);
          if (roCounty) {
            setCounty(roCounty);
            const consts = await adminService.getConstituencies(roCounty.id);
            setConstituencies(consts);
          } else if (allCounties.length > 0) {
            setCounty(allCounties[0]);
            const consts = await adminService.getConstituencies(allCounties[0].id);
            setConstituencies(consts);
          }
        } else if (allCounties.length > 0) {
          setCounty(allCounties[0]);
          const consts = await adminService.getConstituencies(allCounties[0].id);
          setConstituencies(consts);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCounty();
  }, []);

  const loadWards = useCallback(async (constituencyId: string) => {
    try {
      const data = await adminService.getWards(constituencyId);
      setWardMap(prev => ({ ...prev, [constituencyId]: data }));
    } catch (err: any) {
      console.error('Failed to load wards:', err);
    }
  }, []);

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

  const openProposalModal = (type: 'constituency' | 'ward', action: 'create' | 'rename', parentId: string, parentName: string, existingName?: string, existingCode?: string) => {
    setModalType(type);
    setModalAction(action);
    setModalParentId(parentId);
    setModalParentName(parentName);
    setFormData({ name: existingName || '', code: existingCode || '' });
    setShowModal(true);
  };

  const handleSubmitProposal = async () => {
    setModalLoading(true);
    try {
      if (!county) return;

      const action = modalAction === 'create' ? 'create' : 'rename';
      const details: Record<string, any> = {};
      
      if (modalType === 'constituency') {
        if (formData.code) details.constituencyCode = formData.code;
        await adminService.proposeGeographicChange({
          type: 'constituency',
          action,
          resourceId: modalAction === 'rename' ? modalParentId : undefined,
          resourceName: formData.name,
          countyId: county.id,
          countyName: county.countyName,
          details,
        });
      } else {
        if (formData.code) details.wardCode = formData.code;
        if (modalParentId) details.constituencyId = modalParentId;
        await adminService.proposeGeographicChange({
          type: 'ward',
          action,
          resourceId: modalAction === 'rename' ? modalParentId : undefined,
          resourceName: formData.name,
          countyId: county.id,
          countyName: county.countyName,
          details,
        });
      }

      // Reload data
      if (county) {
        const consts = await adminService.getConstituencies(county.id);
        setConstituencies(consts);
      }
      setShowModal(false);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredConstituencies = constituencies.filter(c =>
    c.constituencyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ro-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">County Constituencies & Wards</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          View your county's constituencies and wards. Propose changes for admin approval.
        </p>
      </div>

      {error && (
        <div className="bg-error-light dark:bg-error-900/20 border border-error/20 text-error px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {county && (
        <Card className="bg-ro-50 dark:bg-ro-900/20 border-ro-200 dark:border-ro-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-ro-100 dark:bg-ro-900/30">
              <MapPinIcon className="w-6 h-6 text-ro-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ro-700 dark:text-ro-300">{county.countyName} County</h2>
              <p className="text-sm text-ro-500 dark:text-ro-400">Code: {county.countyCode} • {county.region}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search constituencies..."
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

      {/* Constituency Tree */}
      <div className="space-y-3">
        {filteredConstituencies.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">No constituencies found</p>
            <Button onClick={() => openProposalModal('constituency', 'create', county?.id || '', county?.countyName || '')}>
              <PlusIcon className="w-5 h-5 mr-2" />
              Propose New Constituency
            </Button>
          </Card>
        ) : (
          filteredConstituencies.map((constituency: any) => {
            const isExpanded = expandedConstituencies.has(constituency.id);
            const wards = wardMap[constituency.id] || [];

            return (
              <Card key={constituency.id} className="overflow-hidden">
                {/* Constituency Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleConstituency(constituency.id)}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{constituency.constituencyName}</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Code: {constituency.constituencyCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{constituency.wardCount || 0} wards</span>
                    <Button size="sm" variant="secondary"
                      onClick={() => openProposalModal('constituency', 'rename', constituency.id, constituency.constituencyName, constituency.constituencyName, constituency.constituencyCode)}>
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Rename
                    </Button>
                  </div>
                </div>

                {/* Wards */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="p-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Wards ({wards.length})</span>
                      <Button size="sm" variant="secondary"
                        onClick={() => openProposalModal('ward', 'create', constituency.id, constituency.constituencyName)}>
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Propose Ward
                      </Button>
                    </div>
                    <div className="px-3 pb-3 space-y-1">
                      {wards.length === 0 ? (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4 text-center">No wards found</p>
                      ) : (
                        wards.map((ward: any) => (
                          <div key={ward.id} className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
                            <div>
                              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{ward.wardName}</p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">Code: {ward.wardCode}</p>
                            </div>
                            <Button size="sm" variant="ghost"
                              onClick={() => openProposalModal('ward', 'rename', ward.id, ward.wardName, ward.wardName, ward.wardCode)}>
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Rename
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Proposal Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Propose ${modalAction === 'create' ? 'New' : 'Rename'} ${modalType === 'constituency' ? 'Constituency' : 'Ward'}`}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button disabled={modalLoading || !formData.name} onClick={handleSubmitProposal}>
              {modalLoading ? 'Submitting...' : 'Submit Proposal'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-warning-light dark:bg-warning-900/20 border border-warning/20 rounded-lg p-3">
            <p className="text-sm text-warning-dark dark:text-warning-300">
              <strong>Note:</strong> This proposal will be sent to the admin for approval. Changes will only take effect after admin approval.
            </p>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {modalAction === 'create' ? 'Creating' : 'Renaming'} {modalType} in{' '}
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
