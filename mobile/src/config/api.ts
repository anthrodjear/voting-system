import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  private constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  private getToken(): string | null {
    return null;
  }

  private clearToken(): void {
  }

  setToken(token: string): void {
    this.clearToken();
  }

  async voterLogin(data: { nationalId: string; password: string }) {
    const response = await this.client.post('/voter/auth/login', data);
    return response.data;
  }

  async registerVoter(data: any) {
    const response = await this.client.post('/voter/register', data);
    return response.data;
  }

  async getElections() {
    const response = await this.client.get('/voter/elections');
    return response.data;
  }

  async getCandidates(electionId: string) {
    const response = await this.client.get(`/voter/elections/${electionId}/candidates`);
    return response.data;
  }

  async castVote(data: { electionId: string; candidateId: string; biometricData: string }) {
    const response = await this.client.post('/vote/cast', data);
    return response.data;
  }

  async submitBiometrics(data: { faceData: string; fingerprintData: string }) {
    const response = await this.client.post('/voter/biometrics', data);
    return response.data;
  }

  async verifyBiometrics() {
    const response = await this.client.get('/voter/biometrics/verify');
    return response.data;
  }

  async getVoterProfile() {
    const response = await this.client.get('/voter/profile');
    return response.data;
  }

  async adminLogin(data: { email: string; password: string }) {
    const response = await this.client.post('/admin/auth/login', data);
    return response.data;
  }

  async roLogin(data: { email: string; password: string }) {
    const response = await this.client.post('/ro/auth/login', data);
    return response.data;
  }

  async getAdminStats() {
    const response = await this.client.get('/admin/stats');
    return response.data;
  }

  async getROStats() {
    const response = await this.client.get('/ro/stats');
    return response.data;
  }

  async getVoters(page = 1, limit = 20) {
    const response = await this.client.get(`/admin/voters?page=${page}&limit=${limit}`);
    return response.data;
  }

  async approveVoter(voterId: string) {
    const response = await this.client.post(`/admin/voters/${voterId}/approve`);
    return response.data;
  }

  async getNotifications() {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationRead(notificationId: string) {
    const response = await this.client.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async getResults(electionId?: string) {
    const url = electionId ? `/admin/results/${electionId}` : '/admin/results';
    const response = await this.client.get(url);
    return response.data;
  }

  async getGeographicData(type: 'county' | 'constituency' | 'ward') {
    const response = await this.client.get(`/geographic/${type}`);
    return response.data;
  }

  async getBatchVotes(batchId: string) {
    const response = await this.client.get(`/admin/batches/${batchId}/votes`);
    return response.data;
  }
}

export const api = ApiClient.getInstance();
export default api;