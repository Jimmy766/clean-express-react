import { create } from 'zustand';
import { PaymentState, InitiatePaymentRequest, ConfirmPaymentRequest, InitiatePaymentResponse, ConfirmPaymentResponse } from '../types';
import { apiService } from '../services/api';
import { toast } from 'sonner';

export const usePaymentStore = create<PaymentState>((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,

  initiatePayment: async (data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.initiatePayment(data);
      if (response.success && response.data) {
        set({ currentSession: response.data.sessionId });
        toast.success('Token de pago enviado por email');
        return response.data;
      } else {
        throw new Error(response.message || 'Error al iniciar el pago');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar el pago';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  confirmPayment: async (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.confirmPayment(data);
      if (response.success && response.data) {
        set({ currentSession: null });
        toast.success(`Pago confirmado. Nuevo saldo: $${response.data.newBalance.toLocaleString()}`);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al confirmar el pago');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al confirmar el pago';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSession: () => {
    set({ currentSession: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));