'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AuthProviderInner } from './AuthProviderInner';

type AuthContextType = {
  user: {
    name: string;
    email: string;
    role: 'user' | 'admin' | 'superuser' | null;
  } | null;
  isAdmin: boolean | null;
  isSuperuser: boolean | null;
  logout: () => Promise<void>;
};

// Context holding authentication state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider wrapper that delegates actual logic to inner provider
export const AuthProvider = ({ children }: { children: ReactNode }) => (
  <AuthProviderInner>{children}</AuthProviderInner>
);

// Hook for accessing auth state
export function useAuth() {
  const context = useContext(AuthContext);

  // Ensure hook is only used inside provider
  if (!context) throw new Error('useAuth must be used inside AuthProvider');

  return context;
}

// Export context for internal usage in provider implementation
export { AuthContext };
