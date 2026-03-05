import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import Login from '@/app/(auth)/login/page';
import { useAuth } from '@/src/context/AuthContext';

// ---- mocks ----
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock('@/src/context/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/src/components/BackButton', () => ({
  default: () => <div>BackButton</div>,
}));

vi.mock('@/src/components/login/GoogleLoginButton', () => ({
  default: () => <div>GoogleLoginButton</div>,
}));

vi.mock('@/src/components/login/Spinner', () => ({
  default: () => <div>Spinner</div>,
}));

describe('Login Page (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows spinner when loading', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(<Login />);
    expect(screen.getByText('Spinner')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('redirects when user exists', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      user: { id: '1' },
      isLoading: false,
    });

    render(<Login />);
    expect(mockReplace).toHaveBeenCalledWith('/settings');
    expect(screen.getByText('Spinner')).toBeInTheDocument();
  });

  test('renders login UI when not authenticated', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<Login />);
    expect(screen.getByText('Admin innlogging')).toBeInTheDocument();
    expect(screen.getByText('GoogleLoginButton')).toBeInTheDocument();
    expect(screen.getByText('BackButton')).toBeInTheDocument();
  });
});
