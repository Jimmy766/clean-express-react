import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest,
  Wallet,
  RechargeWalletRequest,
  Transaction,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  PaginatedResponse,
  PaginationParams
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private readonly bearerToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIwMTk5Y2Y3Mi1hNzFjLTcyMjctYTM0NS1hYThjMzQ2Mzk2YWYiLCJqdGkiOiIzOGU2NWE1MTNhMWMzZmYzNGExYzhiMWJjYzlmNmNlYmYxMWVlMzk4NGE0YzA0NGQ1OTFmYWZjZjI3ODZiMzgxZWFlMTEwMmM0NTJiMTEzNSIsImlhdCI6MTc2MTczOTM3My41NTI2ODcsIm5iZiI6MTc2MTczOTM3My41NTI2ODgsImV4cCI6MTc2MTgyNTc3My41NDg3NTEsInN1YiI6IjAxOTljZjcyLTJhNjItNzNjYi05MWQ0LWE5NGE5ZWU4YjVlMCIsInNjb3BlcyI6WyJjYW1iaWFyLXJlcXVlcmltaWVudG8tZXN0YWRvLWEtcGVuZGllbnRlLnJlcXVlcmltaWVudG8iLCJjYW1iaWFyLXJlcXVlcmltaWVudG8tYS1kaXNwb25pYmxlLXBhcmEtYXVkaXRhci5yZXF1ZXJpbWllbnRvIiwiY2FtYmlhci1yZXF1ZXJpbWllbnRvLWVzdGFkby1lbi1yZXZpc2lvbi5yZXF1ZXJpbWllbnRvIiwiY2FtYmlhci1yZXF1ZXJpbWllbnRvLWVzdGFkby1jb24tb2JzZXJ2YWNpb25lcy5yZXF1ZXJpbWllbnRvIiwiY2FtYmlhci1yZXF1ZXJpbWllbnRvLWVzdGFkby1hLXZhbGlkYWRvLnJlcXVlcmltaWVudG8iLCJjYW1iaWFyLXJlcXVlcmltaWVudG8tZXN0YWRvLWEtYXByb2JhZG8ucmVxdWVyaW1pZW50byIsImNhbWJpYXItcmVxdWVyaW1pZW50by1lc3RhZG8tYS1yZWNoYXphZG8ucmVxdWVyaW1pZW50byIsImVsaW1pbmFyLXJlcXVlcmltaWVudG8tY2FyZ2Fkby5yZXF1ZXJpbWllbnRvIiwiZW50cmVnYXItZG9jdW1lbnRhY2lvbi5yZXF1ZXJpbWllbnRvIiwiZW1pdGlyLW9ic2VydmFjaW9uLWRvY3VtZW50by5yZXF1ZXJpbWllbnRvIiwiYXByb2Jhci1kb2N1bWVudG8ucmVxdWVyaW1pZW50byIsImFzaWduYXItcmVxdWVyaW1pZW50by5yZXF1ZXJpbWllbnRvIiwibGlzdGFyLnJlcXVlcmltaWVudG8iLCJ2ZXIucmVxdWVyaW1pZW50byIsImNhbWJpYXItb2JzZXJ2YWNpb24tZXN0YWRvLWEtcGVuZGllbnRlLm9ic2VydmFjaW9uZXMiLCJjYW1iaWFyLW9ic2VydmFjaW9uLWVzdGFkby1hLWNhcmdhZG8ub2JzZXJ2YWNpb25lcyIsImNhbWJpYXItb2JzZXJ2YWNpb24tZXN0YWRvLWEtYXByb2JhZG8ub2JzZXJ2YWNpb25lcyIsImNhbWJpYXItb2JzZXJ2YWNpb24tZXN0YWRvLWEtcmVjaGF6YWRvLm9ic2VydmFjaW9uZXMiLCJyZXZlcnRpci1vYnNlcnZhY2lvbi1hLXBlbmRpZW50ZS5vYnNlcnZhY2lvbmVzIiwiZWxpbWluYXItb2JzZXJ2YWNpb24ub2JzZXJ2YWNpb25lcyIsImVkaXRhci1vYnNlcnZhY2lvbi5vYnNlcnZhY2lvbmVzIiwiY2FtYmlhci1kb2N1bWVudG8tY2FyZ2Fkby1lc3RhZG8tYS1wZW5kaWVudGUuZG9jdW1lbnRvLWNhcmdhZG8iLCJjYW1iaWFyLWRvY3VtZW50by1jYXJnYWRvLWVzdGFkby1hLWNhcmdhZG8uZG9jdW1lbnRvLWNhcmdhZG8iLCJjYW1iaWFyLWRvY3VtZW50by1jYXJnYWRvLWVzdGFkby1lbi1yZXZpc2lvbi5kb2N1bWVudG8tY2FyZ2FkbyIsImNhbWJpYXItZG9jdW1lbnRvLWNhcmdhZG8tZXN0YWRvLWNvbi1vYnNlcnZhY2lvbmVzLmRvY3VtZW50by1jYXJnYWRvIiwiY2FtYmlhci1kb2N1bWVudG8tY2FyZ2Fkby1lc3RhZG8tYS1hcHJvYmFkby5kb2N1bWVudG8tY2FyZ2FkbyIsImNhbWJpYXItZG9jdW1lbnRvLWNhcmdhZG8tZXN0YWRvLWEtcmVjaGF6YWRvLmRvY3VtZW50by1jYXJnYWRvIiwiZWxpbWluYXItZG9jdW1lbnRvLWNhcmdhZG8uZG9jdW1lbnRvLWNhcmdhZG8iLCJsaXN0YXIuc2luZGljYXRvcyIsImNyZWFyLnNpbmRpY2F0b3MiLCJlZGl0YXIuc2luZGljYXRvcyIsImVsaW1pbmFyLnNpbmRpY2F0b3MiLCJ2ZXIuc2luZGljYXRvcyIsInJlZ2lzdHJhci1lbGVjY2lvbi5zaW5kaWNhdG9zIiwibGlzdGFyLnNpbmRpY2F0by1kaXJlY3RpdmEiLCJjcmVhci5zaW5kaWNhdG8tZGlyZWN0aXZhIiwiZWRpdGFyLnNpbmRpY2F0by1kaXJlY3RpdmEiLCJlbGltaW5hci5zaW5kaWNhdG8tZGlyZWN0aXZhIiwibGlzdGFyLmluc3RydW1lbnRvcy1jb2xlY3Rpdm9zIiwiY3JlYXIuaW5zdHJ1bWVudG9zLWNvbGVjdGl2b3MiLCJlZGl0YXIuaW5zdHJ1bWVudG9zLWNvbGVjdGl2b3MiLCJlbGltaW5hci5pbnN0cnVtZW50b3MtY29sZWN0aXZvcyIsImNhcmdhci5pbnN0cnVtZW50b3MtY29sZWN0aXZvcyIsInZlci5pbnN0cnVtZW50b3MtY29sZWN0aXZvcyIsImxpc3Rhci5mdWVyemEtbGFib3JhbCIsImNyZWFyLmZ1ZXJ6YS1sYWJvcmFsIiwiZWRpdGFyLmZ1ZXJ6YS1sYWJvcmFsIiwiZWxpbWluYXIuZnVlcnphLWxhYm9yYWwiLCJsaXN0YXIuam9ybmFkYXMtZXhjZXBjaW9uYWxlcyIsImNyZWFyLmpvcm5hZGFzLWV4Y2VwY2lvbmFsZXMiLCJlZGl0YXIuam9ybmFkYXMtZXhjZXBjaW9uYWxlcyIsImVsaW1pbmFyLmpvcm5hZGFzLWV4Y2VwY2lvbmFsZXMiLCJsaXN0YXIudXN1YXJpb3MiLCJ2ZXIudXN1YXJpb3MiLCJjcmVhci51c3VhcmlvcyIsImVkaXRhci51c3VhcmlvcyIsImVsaW1pbmFyLnVzdWFyaW9zIiwiYWN0aXZhci51c3VhcmlvcyIsImRlc2FjdGl2YXIudXN1YXJpb3MiLCJhc2lnbmFyLXJvbC51c3VhcmlvcyIsImxpc3Rhci5tb2R1bG9zIiwidmVyLm1vZHVsb3MiLCJjcmVhci5tb2R1bG9zIiwiZWRpdGFyLm1vZHVsb3MiLCJlbGltaW5hci5tb2R1bG9zIl19.M1JjYikAA6t5q3kP_4LCDS-n0k_PdH6IBW5kG3MpfsqXa2-DcKZflypTbhO6PUPzY0epc8ClBeejVDYmUc9yrNrZ_yfj9mv6SKudPcC51fl9ForMGEZ2S2ae5U49zY2l6JrURz9XsOMfnfglSl-Puo8IX86zjiqr0jAhr7y7xxfBdV3_3fRRIOggI4DDAiwSFFkKcp-1zO8QLpizN_gKHDrz1WyqxxKKOq6MrXK_zvXn5nJ5pAoDZN04BPH7OH0kidOhWSRq6-oANa9Kb7x25j2us9wABl_k4_PeB5ZAnEXGZyYffj4ZgV6TjgXITahgjT8vp7VBVSnTJqWWWvSpxHkK5cY7iYc2QOP9e45FVVsQfJ46OSsWSF6jvxXn0sxj8yNYfKNCOPYqsMvbbcFRZmQgmpnj6-5r2nqei16_Dg7DPqXxjqmIRS_W-wpXvGiKDpitc9anhsH7XvVOjGWq_DnZGkTm3sqZuGgwlF-laZNOvOC68op-EgN5UbafoKiUfq9Q0W5jJPJ9mtwMvFOV7u7UXGpDA0R-mSzHQCOQUlDsD2r_hMBN7ZYRUpIgJcqVfAMX_bDr24fn7jQJPRV8dL3Olwje98kCKmwQrqjnfwoncZCvUtz_PS8vaxXmCwkm71cJEQbvdGpycDpVZWUNEKzE0_oN0CYUnx1D8Nyuzx4';

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.bearerToken}`
      }
    });


    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );


    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }


  async healthCheck(): Promise<ApiResponse> {
    const response = await this.api.get('/health');
    return response.data;
  }


  async createClient(data: CreateClientRequest): Promise<ApiResponse<Client>> {
    const response = await this.api.post('/clients', data);
    return response.data;
  }

  async getClientById(id: string): Promise<ApiResponse<Client>> {
    const response = await this.api.get(`/clients/${id}`);
    return response.data;
  }

  async getClientByDocument(documento: string): Promise<ApiResponse<Client>> {
    const response = await this.api.get(`/clients/document/${documento}`);
    return response.data;
  }

  async getAllClients(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<Client>>> {
    const response = await this.api.get('/clients', { params });
    return response.data;
  }

  async updateClient(id: string, data: UpdateClientRequest): Promise<ApiResponse<Client>> {
    const response = await this.api.put(`/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/clients/${id}`);
    return response.data;
  }


  async getWalletBalance(clientId: string): Promise<ApiResponse<Wallet>> {
    const response = await this.api.get(`/wallets/balance/${clientId}`);
    return response.data;
  }

  async rechargeWallet(data: RechargeWalletRequest): Promise<ApiResponse<{
    previousBalance: number;
    newBalance: number;
    transaction: Transaction;
  }>> {
    const response = await this.api.post('/wallets/recharge', data);
    return response.data;
  }

  async getTransactionHistory(
    clientId: string, 
    params?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const response = await this.api.get(`/wallets/transactions/${clientId}`, { params });
    return response.data;
  }


  async initiatePayment(data: InitiatePaymentRequest): Promise<ApiResponse<InitiatePaymentResponse>> {
    const response = await this.api.post('/payments/initiate', data);
    return response.data;
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<ApiResponse<ConfirmPaymentResponse>> {
    const response = await this.api.post('/payments/confirm', data);
    return response.data;
  }

  async getTokensByClient(
    clientId: string, 
    params?: PaginationParams & { status?: string }
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.api.get(`/payments/tokens/client/${clientId}`, { params });
    return response.data;
  }

  async cleanExpiredTokens(): Promise<ApiResponse> {
    const response = await this.api.post('/payments/tokens/cleanup');
    return response.data;
  }
}

export const apiService = new ApiService();