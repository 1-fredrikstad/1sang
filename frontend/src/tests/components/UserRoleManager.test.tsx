import type { ComponentProps, PropsWithChildren } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserRoleManager from '@/src/components/admin/UserRoleManager';

const { mockGetSession, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('@/src/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: (props: ComponentProps<'button'>) => <button {...props} />,
}));

vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CollapsibleTrigger: ({ children }: PropsWithChildren) => <div>{children}</div>,
  CollapsibleContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

function mockUsersResponse(users: unknown[]) {
  vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ ok: true, data: users }),
  } as Response);
}

describe('UserRoleManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'test-token',
        },
      },
    });

    global.fetch = vi.fn();
  });

  it('shows loading initially', () => {
    render(<UserRoleManager />);
    expect(screen.getByText(/laster brukere/i)).toBeInTheDocument();
  });

  it('renders users from API', async () => {
    mockUsersResponse([
      {
        user_id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'regular',
      },
    ]);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText(/rolle: vanlig bruker/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no users', async () => {
    mockUsersResponse([]);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText(/ingen brukere funnet/i)).toBeInTheDocument();
    });
  });

  it('shows correct actions for each role', async () => {
    mockUsersResponse([
      { user_id: '1', name: 'A', email: '', role: 'regular' },
      { user_id: '2', name: 'B', email: '', role: 'admin' },
      { user_id: '3', name: 'C', email: '', role: 'superuser' },
    ]);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText(/gjør admin/i)).toBeInTheDocument();
      expect(screen.getByText(/fjern admin/i)).toBeInTheDocument();
      expect(screen.getByText(/rolle: superbruker/i)).toBeInTheDocument();
    });
  });

  it('promotes a user to admin', async () => {
    const user = userEvent.setup();

    mockUsersResponse([{ user_id: '1', name: 'User', email: '', role: 'regular' }]);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    mockUsersResponse([]);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText(/gjør admin/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/gjør admin/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/users/role',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith('Bruker gjort til admin');
    });
  });

  it('demotes an admin to regular', async () => {
    const user = userEvent.setup();

    mockUsersResponse([{ user_id: '1', name: 'Admin', email: '', role: 'admin' }]);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    mockUsersResponse([]);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText(/fjern admin/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/fjern admin/i));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Admin fjernet');
    });
  });

  it('shows error when loading users fails', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Feil' }),
    } as Response);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled();
    });
  });

  it('shows error when updating role fails', async () => {
    const user = userEvent.setup();

    mockUsersResponse([{ user_id: '1', name: 'User', email: '', role: 'regular' }]);

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Oppdatering feilet' }),
    } as Response);

    render(<UserRoleManager />);

    await waitFor(() => {
      expect(screen.getByText(/gjør admin/i)).toBeInTheDocument();
    });

    await user.click(screen.getByText(/gjør admin/i));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Oppdatering feilet');
    });
  });
});
