import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProviderInner } from '@/src/context/AuthProviderInner';
import { useAuth } from '@/src/context/AuthContext';

const { mockGetSession, mockSignOut, mockUnsubscribe, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockSignOut: vi.fn(),
  mockUnsubscribe: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}));

vi.mock('@/src/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

function TestConsumer() {
  const { user, isAdmin, isSuperuser, logout } = useAuth();

  return (
    <div>
      <div data-testid="name">{user?.name ?? 'null'}</div>
      <div data-testid="email">{user?.email ?? 'null'}</div>
      <div data-testid="role">{user?.role ?? 'null'}</div>
      <div data-testid="isAdmin">{String(isAdmin)}</div>
      <div data-testid="isSuperuser">{String(isSuperuser)}</div>
      <button onClick={() => void logout()}>Logout</button>
    </div>
  );
}

describe('AuthProviderInner', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn();

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe,
        },
      },
    });
  });

  function renderProvider() {
    return render(
      <AuthProviderInner>
        <TestConsumer />
      </AuthProviderInner>
    );
  }

  test('shows logged out state when there is no session', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    renderProvider();

    await waitFor(() => expect(screen.queryByText('Laster')).not.toBeInTheDocument());

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('null');
      expect(screen.getByTestId('email').textContent).toBe('null');
      expect(screen.getByTestId('role').textContent).toBe('null');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isSuperuser').textContent).toBe('false');
    });
  });

  test('shows logged in user and superuser state', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            email: 'bruker@eksempel.com',
            user_metadata: {
              full_name: 'Kari Nilsen',
            },
          },
        },
      },
    });

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({
        isAdmin: true,
        isSuperuser: true,
        role: 'superuser',
      }),
    } as Response);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Kari Nilsen');
      expect(screen.getByTestId('email').textContent).toBe('bruker@eksempel.com');
      expect(screen.getByTestId('role').textContent).toBe('superuser');
      expect(screen.getByTestId('isAdmin').textContent).toBe('true');
      expect(screen.getByTestId('isSuperuser').textContent).toBe('true');
    });
  });

  test('shows logged in regular user state', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            email: 'bruker@eksempel.com',
            user_metadata: {
              full_name: 'Kari Nilsen',
            },
          },
        },
      },
    });

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({
        isAdmin: false,
        isSuperuser: false,
        role: 'regular',
      }),
    } as Response);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Kari Nilsen');
      expect(screen.getByTestId('email').textContent).toBe('bruker@eksempel.com');
      expect(screen.getByTestId('role').textContent).toBe('regular');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isSuperuser').textContent).toBe('false');
    });
  });

  test('logout signs out and clears user state', async () => {
    const user = userEvent.setup();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            email: 'bruker@eksempel.com',
            user_metadata: {
              full_name: 'Kari Nilsen',
            },
          },
        },
      },
    });

    mockSignOut.mockResolvedValue(undefined);

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({
        isAdmin: true,
        isSuperuser: true,
        role: 'superuser',
      }),
    } as Response);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Kari Nilsen');
      expect(screen.getByTestId('role').textContent).toBe('superuser');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(screen.getByTestId('name').textContent).toBe('null');
      expect(screen.getByTestId('email').textContent).toBe('null');
      expect(screen.getByTestId('role').textContent).toBe('null');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isSuperuser').textContent).toBe('false');
    });
  });
});
