import { apiClient } from './api-client';

export interface GeographicOption {
  id: string;
  name: string;
  code: string;
}

export const geographicService = {
  /**
   * Fetch all active counties
   * Backend returns: { success: true, data: [...] }
   */
  async getCounties(): Promise<GeographicOption[]> {
    const response = await apiClient.get<{ success: boolean; data: GeographicOption[] }>('/geographic/counties');
    return response.data.data || [];
  },

  /**
   * Fetch constituencies by county ID
   * NOTE: Backend uses query params (?countyId=xxx) not path params
   * Backend returns: { success: true, data: [...] }
   */
  async getConstituenciesByCounty(countyId: string): Promise<GeographicOption[]> {
    const response = await apiClient.get<{ success: boolean; data: GeographicOption[] }>('/geographic/constituencies', {
      params: { countyId },
    });
    return response.data.data || [];
  },

  /**
   * Fetch wards by constituency ID
   * NOTE: Backend uses query params (?constituencyId=xxx) not path params
   * Backend returns: { success: true, data: [...] }
   */
  async getWardsByConstituency(constituencyId: string): Promise<GeographicOption[]> {
    const response = await apiClient.get<{ success: boolean; data: GeographicOption[] }>('/geographic/wards', {
      params: { constituencyId },
    });
    return response.data.data || [];
  },

  /**
   * Get county name by ID
   */
  async getCountyName(countyId: string): Promise<string> {
    const response = await apiClient.get<{ success: boolean; data: { name: string } }>(`/geographic/counties/${countyId}/name`);
    return response.data.data?.name || '';
  },

  /**
   * Get constituency name by ID
   */
  async getConstituencyName(constituencyId: string): Promise<string> {
    const response = await apiClient.get<{ success: boolean; data: { name: string } }>(`/geographic/constituencies/${constituencyId}/name`);
    return response.data.data?.name || '';
  },

  /**
   * Get ward name by ID
   */
  async getWardName(wardId: string): Promise<string> {
    const response = await apiClient.get<{ success: boolean; data: { name: string } }>(`/geographic/wards/${wardId}/name`);
    return response.data.data?.name || '';
  }
};