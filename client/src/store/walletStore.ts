import { create } from 'zustand';
import { WalletState, Transaction, RechargeWalletRequest } from '../types';
import { apiService } from '../services/api';
import { toast } from 'sonner';

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async (clientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getWalletBalance(clientId);
      if (response.success && response.data) {
        set({ balance: response.data.balance });
      } else {
        throw new Error(response.message || 'Error al obtener el saldo');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener el saldo';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (clientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTransactionHistory(clientId, { page: 1, limit: 50 });
      if (response.success && response.data) {
        set({ transactions: response.data.transactions });
      } else {
        throw new Error(response.message || 'Error al obtener las transacciones');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener las transacciones';
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  rechargeWallet: async (data: RechargeWalletRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.rechargeWallet(data);
      if (response.success && response.data) {
        set({ balance: response.data.newBalance });
        // Refresh transactions
        await get().fetchTransactions(data.clientId);
        toast.success(`Recarga exitosa. Nuevo saldo: $${response.data.newBalance.toLocaleString()}`);
      } else {
        throw new Error(response.message || 'Error al recargar la billetera');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al recargar la billetera';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));