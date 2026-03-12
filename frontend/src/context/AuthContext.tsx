'use client';
import { createContext, useContext, ReactNode } from 'react';
import { AuthProviderInner } from './AuthProviderInner';

type AuthContextType = {
  user: { name: string; email: string } | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthProviderInner>{children}</AuthProviderInner>
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export { AuthContext };
