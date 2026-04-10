// ===========================================
// ADMIN SERVICE
// Location: src/services/admin.ts
// ===========================================

import { api, ApiClientException as ApiException } from './api-client';
import type { 
  DashboardStats, 
  ActivityItem, 
  ReturningOfficer,
  User,
  County,
  ApiResponse,
} from '@/types';

// ===========================================
// TYPES
// ===========================================

export interface AdminFilterParams {
  status?: 'pending' | 'approved' | 'suspended';
  county?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface SystemHealth {
  api: { status: string; uptime?: number; message: string };
  database: { status: string; message: string };
  blockchain: { status: string; message: string };
  redis?: { status: string; message: string };
  rabbitmq?: { status: string; message: string };
  memory?: { used: number; total: number; percentage: number };
  cpu?: { usage: number };
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userRole: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  createdAt: string;
}

export interface Election {
  id: string;
  electionName: string;
  electionType: string;
  electionDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  nominationStartDate?: string;
  nominationEndDate?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  status: string;
  enableOnlineVoting: boolean;
  totalVotesCast: number;
  candidateCount?: number;
  registeredVoters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  candidateNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  countyName?: string;
  partyName?: string;
  partyAbbreviation?: string;
  isIndependent: boolean;
  photo?: string;
  manifesto?: string;
  status: string;
  electionId?: string;
  submittedAt?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface Voter {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  countyName?: string;
  constituencyName?: string;
  wardName?: string;
  status: string;
  nationalIdVerified: boolean;
  registeredAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  level: string;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===========================================
// DASHBOARD
// ===========================================

export async function getDashboardStats(): Promise<any> {
  try {
    // api.get() already unwraps response.data.data, so response IS the data
    const data = await api.get<any>('/admin/dashboard/stats');
    return data || {};
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get dashboard stats');
    }
    throw error;
  }
}

export async function getActivityFeed(
  params?: { limit?: number }
): Promise<ActivityItem[]> {
  try {
    const data = await api.get<ActivityItem[]>(
      '/admin/dashboard/activity',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get activity feed');
    }
    throw error;
  }
}

export async function clearAuditLogs(): Promise<void> {
  try {
    await api.delete('/admin/audit-logs');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to clear audit logs');
    }
    throw error;
  }
}

// ===========================================
// RETURNING OFFICERS
// ===========================================

export async function getReturningOfficers(
  params: AdminFilterParams = {}
): Promise<{ officers: any[]; pagination: any }> {
  try {
    const data = await api.get<{ officers: any[]; pagination: any }>(
      '/admin/returning-officers',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { officers: [], pagination: { page: 1, limit: 20, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get returning officers');
    }
    throw error;
  }
}

export async function getReturningOfficerById(id: string): Promise<any> {
  try {
    const data = await api.get<any>(`/admin/returning-officers/${id}`);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get returning officer');
    }
    throw error;
  }
}

export async function approveRO(id: string, assignedCounty?: string): Promise<void> {
  try {
    await api.put(`/admin/ro/applications/${id}`, {
      action: 'approve',
      assignedCounty,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to approve returning officer');
    }
    throw error;
  }
}

export async function rejectRO(id: string, reason: string): Promise<void> {
  try {
    await api.put(`/admin/ro/applications/${id}`, {
      action: 'reject',
      notes: reason,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject returning officer');
    }
    throw error;
  }
}

export async function suspendRO(id: string, reason?: string): Promise<void> {
  try {
    await api.post(`/admin/returning-officers/${id}/suspend`, { reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to suspend returning officer');
    }
    throw error;
  }
}

export async function reactivateRO(id: string): Promise<void> {
  try {
    await api.post(`/admin/returning-officers/${id}/reactivate`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reactivate returning officer');
    }
    throw error;
  }
}

export async function assignROToCounty(
  roId: string,
  countyName: string,
  countyId: string
): Promise<void> {
  try {
    await api.post(`/admin/returning-officers/${roId}/assign-county`, {
      countyName,
      countyId,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to assign returning officer');
    }
    throw error;
  }
}

// ===========================================
// COUNTIES
// ===========================================

export async function getCounties(): Promise<any[]> {
  try {
    const data = await api.get<any[]>('/admin/counties');
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get counties');
    }
    throw error;
  }
}

export async function getCountyByCode(code: string): Promise<any> {
  try {
    const data = await api.get<any>(`/admin/counties/${code}`);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get county');
    }
    throw error;
  }
}

export async function createCounty(data: {
  countyCode: string;
  countyName: string;
  region: string;
  capital?: string;
  population?: number;
  areaSqKm?: number;
}): Promise<any> {
  try {
    const result = await api.post<any>('/admin/counties', data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create county');
    }
    throw error;
  }
}

export async function updateCounty(
  code: string,
  data: Partial<{ countyName: string; region: string; capital: string; population: number }>
): Promise<any> {
  try {
    const result = await api.put<any>(`/admin/counties/${code}`, data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update county');
    }
    throw error;
  }
}

export async function updateCountyStatus(code: string, isActive: boolean): Promise<any> {
  try {
    const result = await api.patch<any>(`/admin/counties/${code}/status`, { isActive });
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update county status');
    }
    throw error;
  }
}

export async function getCountyConstituencies(code: string): Promise<any[]> {
  try {
    const data = await api.get<any[]>(`/admin/counties/${code}/constituencies`);
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get constituencies');
    }
    throw error;
  }
}

// ===========================================
// CONSTITUENCIES (Full CRUD)
// ===========================================

export async function getConstituencies(countyId?: string): Promise<any[]> {
  try {
    const params = countyId ? { countyId } : undefined;
    const data = await api.get<any[]>('/admin/constituencies', { params });
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get constituencies');
    }
    throw error;
  }
}

export async function getConstituencyById(id: string): Promise<any> {
  try {
    const data = await api.get<any>(`/admin/constituencies/${id}`);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get constituency');
    }
    throw error;
  }
}

export async function createConstituency(data: {
  constituencyCode: string;
  constituencyName: string;
  countyId: string;
}): Promise<any> {
  try {
    const result = await api.post<any>('/admin/constituencies', data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create constituency');
    }
    throw error;
  }
}

export async function updateConstituency(
  id: string,
  data: { constituencyName?: string; countyId?: string }
): Promise<any> {
  try {
    const result = await api.put<any>(`/admin/constituencies/${id}`, data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update constituency');
    }
    throw error;
  }
}

export async function updateConstituencyStatus(id: string, isActive: boolean): Promise<any> {
  try {
    const result = await api.patch<any>(`/admin/constituencies/${id}/status`, { isActive });
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update constituency status');
    }
    throw error;
  }
}

export async function deleteConstituency(id: string): Promise<any> {
  try {
    const result = await api.delete<any>(`/admin/constituencies/${id}`);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to delete constituency');
    }
    throw error;
  }
}

// ===========================================
// WARDS (Full CRUD)
// ===========================================

export async function getWards(constituencyId?: string): Promise<any[]> {
  try {
    const params = constituencyId ? { constituencyId } : undefined;
    const data = await api.get<any[]>('/admin/wards', { params });
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get wards');
    }
    throw error;
  }
}

export async function getWardById(id: string): Promise<any> {
  try {
    const data = await api.get<any>(`/admin/wards/${id}`);
    return data;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get ward');
    }
    throw error;
  }
}

export async function createWard(data: {
  wardCode: string;
  wardName: string;
  constituencyId: string;
}): Promise<any> {
  try {
    const result = await api.post<any>('/admin/wards', data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create ward');
    }
    throw error;
  }
}

export async function updateWard(
  id: string,
  data: { wardName?: string; constituencyId?: string }
): Promise<any> {
  try {
    const result = await api.put<any>(`/admin/wards/${id}`, data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update ward');
    }
    throw error;
  }
}

export async function updateWardStatus(id: string, isActive: boolean): Promise<any> {
  try {
    const result = await api.patch<any>(`/admin/wards/${id}/status`, { isActive });
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update ward status');
    }
    throw error;
  }
}

export async function deleteWard(id: string): Promise<any> {
  try {
    const result = await api.delete<any>(`/admin/wards/${id}`);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to delete ward');
    }
    throw error;
  }
}

// ===========================================
// GEOGRAPHIC CHANGE PROPOSALS (RO → Admin approval)
// ===========================================

export async function proposeGeographicChange(data: {
  type: 'constituency' | 'ward';
  action: 'create' | 'update' | 'rename' | 'delete';
  resourceId?: string;
  resourceName: string;
  countyId: string;
  countyName: string;
  details?: Record<string, any>;
}): Promise<any> {
  try {
    const result = await api.post<any>('/admin/geographic-changes', data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to propose geographic change');
    }
    throw error;
  }
}

export async function getPendingGeographicChanges(countyId?: string): Promise<any[]> {
  try {
    const params = countyId ? { countyId } : undefined;
    const data = await api.get<any[]>('/admin/geographic-changes/pending', { params });
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get pending changes');
    }
    throw error;
  }
}

export async function reviewGeographicChange(
  id: string,
  action: 'approved' | 'rejected',
  notes?: string
): Promise<any> {
  try {
    const result = await api.put<any>(`/admin/geographic-changes/${id}/review`, { action, notes });
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to review geographic change');
    }
    throw error;
  }
}

export async function getMyProposals(): Promise<any[]> {
  try {
    const data = await api.get<any[]>('/admin/geographic-changes/my-proposals');
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get my proposals');
    }
    throw error;
  }
}

// ===========================================
// ELECTIONS
// ===========================================

export async function getElections(params?: {
  electionType?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ elections: Election[]; pagination: any }> {
  try {
    const data = await api.get<{ elections: Election[]; pagination: any }>(
      '/admin/elections',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { elections: [], pagination: { page: 1, limit: 20, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get elections');
    }
    throw error;
  }
}

export async function getElectionById(id: string): Promise<Election> {
  try {
    const data = await api.get<Election>(`/admin/elections/${id}`);
    return data!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get election');
    }
    throw error;
  }
}

export async function createElection(data: {
  electionName: string;
  electionType: string;
  electionDate: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  nominationStartDate?: string;
  nominationEndDate?: string;
  votingStartDate?: string;
  votingEndDate?: string;
  enableOnlineVoting?: boolean;
}): Promise<Election> {
  try {
    const result = await api.post<Election>('/admin/elections', data);
    return result!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create election');
    }
    throw error;
  }
}

export async function updateElection(
  id: string,
  data: Partial<Election>
): Promise<Election> {
  try {
    const result = await api.put<Election>(`/admin/elections/${id}`, data);
    return result!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update election');
    }
    throw error;
  }
}

export async function updateElectionStatus(id: string, status: string): Promise<Election> {
  try {
    const result = await api.patch<Election>(
      `/admin/elections/${id}/status`,
      { status }
    );
    return result!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update election status');
    }
    throw error;
  }
}

export async function deleteElection(id: string): Promise<void> {
  try {
    await api.delete(`/admin/elections/${id}`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to delete election');
    }
    throw error;
  }
}

// ===========================================
// CANDIDATES
// ===========================================

export async function getCandidates(params?: {
  position?: string;
  status?: string;
  electionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ candidates: Candidate[]; pagination: any }> {
  try {
    const data = await api.get<{ candidates: Candidate[]; pagination: any }>(
      '/admin/candidates',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { candidates: [], pagination: { page: 1, limit: 20, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get candidates');
    }
    throw error;
  }
}

export async function createCandidate(data: {
  firstName: string;
  lastName: string;
  middleName?: string;
  position: string;
  countyId?: string;
  countyName?: string;
  constituencyId?: string;
  wardId?: string;
  partyName?: string;
  partyAbbreviation?: string;
  isIndependent?: boolean;
  dateOfBirth?: string;
  photo?: string;
  manifesto?: string;
  electionId?: string;
}): Promise<any> {
  try {
    const result = await api.post<any>('/admin/candidates', data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create candidate');
    }
    throw error;
  }
}

export async function updateCandidate(
  id: string,
  data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    partyName?: string;
    partyAbbreviation?: string;
    photo?: string;
    manifesto?: string;
  }
): Promise<any> {
  try {
    const result = await api.put<any>(`/admin/candidates/${id}`, data);
    return result;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update candidate');
    }
    throw error;
  }
}

export async function approveCandidate(id: string): Promise<void> {
  try {
    await api.patch(`/admin/candidates/${id}/status`, { status: 'approved' });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to approve candidate');
    }
    throw error;
  }
}

export async function rejectCandidate(id: string, reason?: string): Promise<void> {
  try {
    await api.patch(`/admin/candidates/${id}/status`, {
      status: 'rejected',
      rejectionReason: reason,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject candidate');
    }
    throw error;
  }
}

export async function deleteCandidate(id: string): Promise<void> {
  try {
    await api.delete(`/admin/candidates/${id}`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to delete candidate');
    }
    throw error;
  }
}

// ===========================================
// VOTERS
// ===========================================

export async function getVoters(params?: {
  county?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ voters: Voter[]; pagination: any }> {
  try {
    const data = await api.get<{ voters: Voter[]; pagination: any }>(
      '/admin/voters',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { voters: [], pagination: { page: 1, limit: 20, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voters');
    }
    throw error;
  }
}

export async function updateVoterStatus(
  id: string,
  status: string,
  reason?: string
): Promise<void> {
  try {
    await api.patch(`/admin/voters/${id}/status`, { status, reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update voter status');
    }
    throw error;
  }
}

export async function getVoterStatsByCounty(): Promise<any[]> {
  try {
    const data = await api.get<any[]>('/admin/voters/stats/by-county');
    return data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get voter stats');
    }
    throw error;
  }
}

// ===========================================
// ADMIN USERS
// ===========================================

export async function getAdminUsers(
  params?: { page?: number; limit?: number }
): Promise<{ users: AdminUser[]; pagination: any }> {
  try {
    const data = await api.get<{ users: AdminUser[]; pagination: any }>(
      '/admin/users',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { users: [], pagination: { page: 1, limit: 20, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get admin users');
    }
    throw error;
  }
}

export async function createAdminUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  level?: string;
}): Promise<AdminUser> {
  try {
    const result = await api.post<AdminUser>('/admin/users', data);
    return result!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create admin user');
    }
    throw error;
  }
}

export async function updateAdminUser(
  id: string,
  data: Partial<AdminUser>
): Promise<AdminUser> {
  try {
    const result = await api.put<AdminUser>(`/admin/users/${id}`, data);
    return result!;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update admin user');
    }
    throw error;
  }
}

export async function updateAdminUserStatus(id: string, isActive: boolean): Promise<void> {
  try {
    await api.patch(`/admin/users/${id}/status`, { isActive });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update admin user status');
    }
    throw error;
  }
}

// ===========================================
// SYSTEM
// ===========================================

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await api.get<SystemHealth>('/admin/system/health');
    // api.get() already unwraps response.data.data, so response IS the SystemHealth object
    return response || {
      api: { status: 'unknown', message: '' },
      database: { status: 'unknown', message: '' },
      blockchain: { status: 'unknown', message: '' },
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get system health');
    }
    throw error;
  }
}

export async function getAuditLogs(
  params?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ logs: AuditLog[]; pagination: any }> {
  try {
    const data = await api.get<{ logs: AuditLog[]; pagination: any }>(
      '/admin/audit-logs',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    return data || { logs: [], pagination: { page: 1, limit: 50, total: 0 } };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get audit logs');
    }
    throw error;
  }
}

export default {
  // Dashboard
  getDashboardStats,
  getActivityFeed,
  // Returning Officers
  getReturningOfficers,
  getReturningOfficerById,
  approveRO,
  rejectRO,
  suspendRO,
  reactivateRO,
  assignROToCounty,
  // Counties
  getCounties,
  getCountyByCode,
  createCounty,
  updateCounty,
  updateCountyStatus,
  getCountyConstituencies,
  // Constituencies
  getConstituencies,
  getConstituencyById,
  createConstituency,
  updateConstituency,
  updateConstituencyStatus,
  deleteConstituency,
  // Wards
  getWards,
  getWardById,
  createWard,
  updateWard,
  updateWardStatus,
  deleteWard,
  // Geographic Change Proposals
  proposeGeographicChange,
  getPendingGeographicChanges,
  reviewGeographicChange,
  getMyProposals,
  // Elections
  getElections,
  getElectionById,
  createElection,
  updateElection,
  updateElectionStatus,
  deleteElection,
  // Candidates
  getCandidates,
  createCandidate,
  updateCandidate,
  approveCandidate,
  rejectCandidate,
  deleteCandidate,
  // Voters
  getVoters,
  updateVoterStatus,
  getVoterStatsByCounty,
  // Admin Users
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  updateAdminUserStatus,
  // System
  getSystemHealth,
  getAuditLogs,
  clearAuditLogs,
};
