import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from '@/src/context/AuthContext';

vi.mock('@/src/context/AuthProviderInner', () => ({
  AuthProviderInner: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider-inner">{children}</div>
  ),
}));

function TestConsumer() {
  const auth = useAuth();
  return <div>{auth ? 'has-auth' : 'no-auth'}</div>;
}

describe('AuthContext', () => {
  test('useAuth throws when used outside AuthProvider', () => {
    expect(() => render(<TestConsumer />)).toThrow('useAuth must be used inside AuthProvider');
  });

  test('AuthProvider renders children', () => {
    render(
      <AuthProvider>
        <div>Child content</div>
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-provider-inner')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('useAuth returns context value inside provider', () => {
    function Consumer() {
      const auth = useAuth();
      return (
        <div>
          {auth.user?.email} / {String(auth.isAdmin)} / {String(auth.isLoading)}
        </div>
      );
    }

    render(
      <AuthContext.Provider
        value={{
          user: { name: 'Test User', email: 'test@example.com' },
          isAdmin: true,
          isLoading: false,
          logout: vi.fn(),
        }}
      >
        <Consumer />
      </AuthContext.Provider>
    );

    expect(screen.getByText('test@example.com / true / false')).toBeInTheDocument();
  });
});
