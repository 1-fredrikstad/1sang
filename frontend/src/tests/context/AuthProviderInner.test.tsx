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
  const { user, isAdmin, isLoading, logout } = useAuth();

  return (
    <div>
      <div data-testid="name">{user?.name ?? 'null'}</div>
      <div data-testid="email">{user?.email ?? 'null'}</div>
      <div data-testid="isAdmin">{String(isAdmin)}</div>
      <div data-testid="isLoading">{String(isLoading)}</div>
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

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('null');
      expect(screen.getByTestId('email').textContent).toBe('null');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });
  });

  test('shows logged in user and admin state', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            email: 'user@example.com',
            user_metadata: {
              full_name: 'Jane Doe',
            },
          },
        },
      },
    });

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({ isAdmin: true }),
    } as Response);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Jane Doe');
      expect(screen.getByTestId('email').textContent).toBe('user@example.com');
      expect(screen.getByTestId('isAdmin').textContent).toBe('true');
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });
  });

  test('logout signs out and clears user state', async () => {
    const user = userEvent.setup();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'token-123',
          user: {
            email: 'user@example.com',
            user_metadata: {
              full_name: 'Jane Doe',
            },
          },
        },
      },
    });

    mockSignOut.mockResolvedValue(undefined);

    vi.mocked(global.fetch).mockResolvedValue({
      json: async () => ({ isAdmin: true }),
    } as Response);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Jane Doe');
    });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(screen.getByTestId('name').textContent).toBe('null');
      expect(screen.getByTestId('email').textContent).toBe('null');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isLoading').textContent).toBe('false');
    });
  });
});
