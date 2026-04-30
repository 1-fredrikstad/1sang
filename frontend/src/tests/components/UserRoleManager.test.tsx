import type { ComponentProps, PropsWithChildren } from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserRoleManager, { type AdminUser } from '@/src/components/admin/UserRoleManager';

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

describe('UserRoleManager', () => {
  const mockOnReload = vi.fn();

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

  function renderComponent({
    users = [],
    loading = false,
  }: {
    users?: AdminUser[];
    loading?: boolean;
  } = {}) {
    return render(<UserRoleManager users={users} loading={loading} onReload={mockOnReload} />);
  }

  test('shows loading state', () => {
    renderComponent({ loading: true });

    expect(screen.getByText(/laster brukere/i)).toBeInTheDocument();
  });

  test('renders users from props', async () => {
    renderComponent({
      users: [
        {
          user_id: '1',
          name: 'Testbruker',
          email: 'test@example.com',
          role: 'regular',
        },
      ],
    });

    expect(screen.getByText('Testbruker')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText(/rolle: vanlig bruker/i)).toBeInTheDocument();
  });

  test('shows empty state when no users', () => {
    renderComponent({ users: [] });

    expect(screen.getByText(/ingen brukere funnet/i)).toBeInTheDocument();
  });

  test('shows correct actions for each role', () => {
    renderComponent({
      users: [
        { user_id: '1', name: 'A', email: '', role: 'regular' },
        { user_id: '2', name: 'B', email: '', role: 'admin' },
        { user_id: '3', name: 'C', email: '', role: 'superuser' },
      ],
    });

    expect(screen.getByText(/gjør admin/i)).toBeInTheDocument();
    expect(screen.getByText(/fjern admin/i)).toBeInTheDocument();
    expect(screen.getByText(/rolle: superbruker/i)).toBeInTheDocument();
  });

  test('promotes a user to admin', async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    mockOnReload.mockResolvedValue(undefined);

    renderComponent({
      users: [{ user_id: '1', name: 'Bruker', email: '', role: 'regular' }],
    });

    await user.click(screen.getByText(/gjør admin/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/users/role',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            targetUserId: '1',
            role: 'admin',
          }),
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith('Bruker gjort til admin');
      expect(mockOnReload).toHaveBeenCalled();
    });
  });

  test('demotes an admin to regular', async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    mockOnReload.mockResolvedValue(undefined);

    renderComponent({
      users: [{ user_id: '1', name: 'Admin', email: '', role: 'admin' }],
    });

    await user.click(screen.getByText(/fjern admin/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/users/role',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            targetUserId: '1',
            role: 'regular',
          }),
        })
      );
      expect(mockToastSuccess).toHaveBeenCalledWith('Admin fjernet');
      expect(mockOnReload).toHaveBeenCalled();
    });
  });

  test('shows error when updating role fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Oppdatering feilet' }),
    } as Response);

    renderComponent({
      users: [{ user_id: '1', name: 'Bruker', email: '', role: 'regular' }],
    });

    await user.click(screen.getByText(/gjør admin/i));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Oppdatering feilet');
    });
  });
});
