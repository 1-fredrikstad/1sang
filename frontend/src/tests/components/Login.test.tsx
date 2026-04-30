import { describe, test, expect, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';

// Mock the components used inside Login
vi.mock('@/src/components/login/GoogleLoginButton', () => ({
  default: () => <div>GoogleLoginButton</div>,
}));

vi.mock('@/components/ui/spinner', () => ({
  Spinner: ({ message }: { message: string }) => <div>{message}</div>,
}));

// Mock the useAuth hook
vi.mock('@/src/context/AuthContext');

describe('Login component', () => {
  test('renders Spinner when user is logged in', () => {
    vi.useFakeTimers();

    (useAuth as unknown as Mock).mockReturnValue({ user: { name: 'Test' }, isLoading: false });
    render(<Login />);

    vi.advanceTimersByTime(400);
    expect(screen.getByText('Laster inn')).toBeInTheDocument();

    vi.useRealTimers();
  });

  test('renders login form when not loading and no user', () => {
    (useAuth as unknown as Mock).mockReturnValue({ user: null, isLoading: false });
    render(<Login />);
    expect(screen.getByText('Admin innlogging')).toBeInTheDocument();
    expect(screen.getByText('GoogleLoginButton')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });
});
