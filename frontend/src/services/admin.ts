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
  PaginatedResponse 
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
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpu: number;
  memory: number;
  disk: number;
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    latency?: number;
  }>;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

// ===========================================
// ADMIN SERVICE FUNCTIONS
// ===========================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    
    if (response.data) {
      return response.data;
    }
    
    // Return default stats if empty
    return {
      voters: { total: 0, registered: 0, verified: 0, pending: 0, change: 0 },
      votes: { total: 0, turnout: 0, lastHour: 0 },
      counties: { total: 0, active: 0 },
      ro: { total: 0, approved: 0, pending: 0 },
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get dashboard stats');
    }
    throw error;
  }
}

/**
 * Get recent activity feed
 */
export async function getActivityFeed(
  params?: { limit?: number; type?: string }
): Promise<ActivityItem[]> {
  try {
    const response = await api.get<ApiResponse<ActivityItem[]>>(
      '/admin/dashboard/activity',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get activity feed');
    }
    throw error;
  }
}

/**
 * Get returning officer applications
 * NOTE: Maps /admin/ro/applications response to ReturningOfficer[]
 */
export async function getReturningOfficers(
  params: AdminFilterParams = {}
): Promise<PaginatedResponse<ReturningOfficer>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<ReturningOfficer>>>(
      '/admin/ro/applications',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    if (response.data) {
      return response.data;
    }
    
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get returning officers');
    }
    throw error;
  }
}

/**
 * Get returning officer by ID
 */
export async function getReturningOfficerById(id: string): Promise<ReturningOfficer> {
  try {
    const response = await api.get<ApiResponse<ReturningOfficer>>(
      `/admin/returning-officers/${id}`
    );
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Returning officer not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get returning officer');
    }
    throw error;
  }
}

/**
 * Approve returning officer application
 */
export async function approveRO(id: string, assignedCounty?: string): Promise<void> {
  try {
    await api.put(`/admin/ro/applications/${id}`, {
      action: 'approve',
      assignedCounty: assignedCounty
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to approve returning officer');
    }
    throw error;
  }
}

/**
 * Reject returning officer application
 */
export async function rejectRO(id: string, reason: string): Promise<void> {
  try {
    await api.put(`/admin/ro/applications/${id}`, {
      action: 'reject',
      notes: reason
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to reject returning officer');
    }
    throw error;
  }
}

/**
 * Suspend returning officer
 */
export async function suspendRO(id: string, reason: string): Promise<void> {
  try {
    await api.post(`/admin/returning-officers/${id}/suspend`, { reason });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to suspend returning officer');
    }
    throw error;
  }
}

/**
 * Reactivate returning officer
 */
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

/**
 * Get all counties
 */
export async function getCounties(): Promise<County[]> {
  try {
    const response = await api.get<ApiResponse<County[]>>('/admin/counties');
    
    return response.data || [];
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get counties');
    }
    throw error;
  }
}

/**
 * Get county by code
 */
export async function getCountyByCode(code: string): Promise<County> {
  try {
    const response = await api.get<ApiResponse<County>>(`/admin/counties/${code}`);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('County not found');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get county');
    }
    throw error;
  }
}

/**
 * Assign returning officer to county
 */
export async function assignROToCounty(roId: string, countyCode: string): Promise<void> {
  try {
    await api.post(`/admin/returning-officers/${roId}/assign-county`, {
      countyCode,
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to assign returning officer');
    }
    throw error;
  }
}

/**
 * Get system health status
 * NOTE: Uses /health endpoint since /admin/system/health doesn't exist
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await api.get<ApiResponse<SystemHealth>>('/health');
    
    return response.data || {
      status: 'critical',
      uptime: 0,
      cpu: 0,
      memory: 0,
      disk: 0,
      services: [],
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get system health');
    }
    throw error;
  }
}

/**
 * Get audit logs
 * NOTE: Uses /reports/audit endpoint instead of /admin/audit-logs
 */
export async function getAuditLogs(
  params?: {
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<PaginatedResponse<AuditLog>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLog>>>(
      '/reports/audit',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get audit logs');
    }
    throw error;
  }
}

/**
 * Get admin users list
 */
export async function getAdminUsers(
  params?: { role?: string; status?: string; page?: number; pageSize?: number }
): Promise<PaginatedResponse<User>> {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>(
      '/admin/users',
      { params: params as Record<string, string | number | boolean | undefined> }
    );
    
    return response.data || {
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    };
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to get admin users');
    }
    throw error;
  }
}

/**
 * Create admin user
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin';
}): Promise<User> {
  try {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to create admin user');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to create admin user');
    }
    throw error;
  }
}

/**
 * Update admin user
 */
export async function updateAdminUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  try {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('Failed to update admin user');
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to update admin user');
    }
    throw error;
  }
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(id: string): Promise<void> {
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(error.message || 'Failed to delete admin user');
    }
    throw error;
  }
}

export default {
  getDashboardStats,
  getActivityFeed,
  getReturningOfficers,
  getReturningOfficerById,
  approveRO,
  rejectRO,
  suspendRO,
  reactivateRO,
  getCounties,
  getCountyByCode,
  assignROToCounty,
  getSystemHealth,
  getAuditLogs,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
