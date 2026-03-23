import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import Login from '@/src/components/pages/LoginPage';
import { useAuth } from '@/src/context/AuthContext';

// Mock the components used inside Login
vi.mock('@/src/components/login/GoogleLoginButton', () => ({
  default: () => <div>GoogleLoginButton</div>,
}));

vi.mock('@/src/components/login/Spinner', () => ({
  default: () => <div>Spinner</div>,
}));

// Mock the useAuth hook
vi.mock('@/src/context/AuthContext');

describe('Login component', () => {
  it('renders Spinner when loading', () => {
    (useAuth as unknown as Mock).mockReturnValue({ user: null, isLoading: true });
    render(<Login />);
    expect(screen.getByText('Laster inn')).toBeInTheDocument();
  });

  it('renders Spinner when user is logged in', () => {
    (useAuth as unknown as Mock).mockReturnValue({ user: { name: 'Test' }, isLoading: false });
    render(<Login />);
    expect(screen.getByText('Laster inn')).toBeInTheDocument();
  });

  it('renders login form when not loading and no user', () => {
    (useAuth as unknown as Mock).mockReturnValue({ user: null, isLoading: false });
    render(<Login />);
    expect(screen.getByText('Admin innlogging')).toBeInTheDocument();
    expect(screen.getByText('GoogleLoginButton')).toBeInTheDocument();
    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });
});
