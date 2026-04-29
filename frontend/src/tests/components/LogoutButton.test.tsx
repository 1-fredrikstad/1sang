import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from '@/src/components/admin/LogoutButton';
import { toast } from 'sonner';

const mockLogout = vi.fn().mockResolvedValue(undefined);

// -- Mock auth ---
vi.mock('@/src/context/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

// --- Mock router ---
const mockRouter = {
  replace: vi.fn(),
  push: vi.fn(),
  back: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/some-path',
}));

// --- Mock toast ---
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// --- Test ---
describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the logout trigger button', () => {
    render(<LogoutButton />);

    expect(screen.getByRole('button', { name: /logg ut/i })).toBeInTheDocument();
  });

  test('opens confirmation dialog when clicking Logg ut', async () => {
    const user = userEvent.setup();

    render(<LogoutButton />);

    await user.click(screen.getByRole('button', { name: /logg ut/i }));

    // Dialog should open
    expect(screen.getByText('Er du sikker på at du vil logge ut?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /avbryt/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Bekreftelse på logg ut/i })).toBeInTheDocument();
  });

  it('calls logout and redirects to /admin when confirming', async () => {
    const user = userEvent.setup();

    render(<LogoutButton />);

    // Dialog should open
    await user.click(screen.getByRole('button', { name: /logg ut/i }));

    const confirmButton = screen.getByRole('button', {
      name: /Bekreftelse på logg ut/i,
    });

    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin');
    });

    // Dialog should close
    expect(screen.queryByText('Er du sikker på at du vil logge ut?')).not.toBeInTheDocument();
  });

  test('closes dialog without logging out when clicking Avbryt', async () => {
    const user = userEvent.setup();

    render(<LogoutButton />);

    // Dialog should appear
    await user.click(screen.getByRole('button', { name: /logg ut/i }));

    await user.click(screen.getByRole('button', { name: /avbryt/i }));

    // No logout or redirect
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Er du sikker på at du vil logge ut?')).not.toBeInTheDocument();
    });
  });

  test('still redirects even if logout fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Logout fails
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'));

    render(<LogoutButton />);

    await user.click(screen.getByRole('button', { name: /logg ut/i }));
    await user.click(screen.getByRole('button', { name: /Bekreftelse på logg ut/i }));

    // Toast called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Logout failed');
      expect(mockRouter.replace).toHaveBeenCalledWith('/admin');
    });

    // Dialog should close
    expect(screen.queryByText('Er du sikker på at du vil logge ut?')).not.toBeInTheDocument();
  });
});
