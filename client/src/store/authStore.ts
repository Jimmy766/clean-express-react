import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, Client } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      client: null,
      isAuthenticated: false,
      
      login: (client: Client) => {
        set({ 
          client, 
          isAuthenticated: true 
        });
      },
      
      logout: () => {
        set({ 
          client: null, 
          isAuthenticated: false 
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        client: state.client, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);