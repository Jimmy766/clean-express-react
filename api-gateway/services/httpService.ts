import axios, { AxiosInstance, AxiosResponse } from 'axios';

class HttpService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.DATABASE_SERVICE_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });


    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Database Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );


    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ Database Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message
        });
        return Promise.reject(error);
      }
    );
  }


  async get(url: string, params?: any): Promise<AxiosResponse> {
    return this.client.get(url, { params });
  }


  async post(url: string, data?: any): Promise<AxiosResponse> {
    return this.client.post(url, data);
  }


  async put(url: string, data?: any): Promise<AxiosResponse> {
    return this.client.put(url, data);
  }


  async patch(url: string, data?: any): Promise<AxiosResponse> {
    return this.client.patch(url, data);
  }


  async delete(url: string): Promise<AxiosResponse> {
    return this.client.delete(url);
  }
}

export const httpService = new HttpService();