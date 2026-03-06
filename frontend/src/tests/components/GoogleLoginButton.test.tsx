import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoogleLoginButton from '../../components/login/GoogleLoginButton';
import { vi, beforeEach, describe, test, expect } from 'vitest';

// Mock Supabase client
const mockSignIn = vi.fn();

vi.mock('../../lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: { signInWithOAuth: mockSignIn },
  })),
}));

// Mock window.location.origin
Object.defineProperty(window, 'location', {
  value: { origin: 'http://localhost' },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  mockSignIn.mockReset();
});

describe('GoogleLoginButton', () => {
  test('renders button with logo', () => {
    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: /logg inn med google/i });
    expect(button).toBeInTheDocument();

    const logo = screen.getByAltText('Google logo');
    expect(logo).toBeInTheDocument();
  });

  test('clicking button calls Supabase signInWithOAuth with Google provider', async () => {
    mockSignIn.mockResolvedValue({ error: null });

    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: /logg inn med google/i });

    await userEvent.click(button);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost/settings' },
    });
  });

  test('handles Supabase error without crashing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockSignIn.mockResolvedValue({ error: { message: 'Login failed' } });

    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: /logg inn med google/i });

    await userEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith('Login error:', { message: 'Login failed' });

    consoleSpy.mockRestore();
  });
});
