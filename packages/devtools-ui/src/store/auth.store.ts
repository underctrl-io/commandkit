import { create } from 'zustand';

export interface AuthStore {
  authenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  authenticated: false,
  setAuthenticated: (auth) => set({ authenticated: auth }),
}));
