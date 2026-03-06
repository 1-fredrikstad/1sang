import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, Mock } from 'vitest';
import Login from '@/app/(auth)/login/page';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock('@/src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/src/context/AuthContext';

describe('Login Page (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders full login page correctly', () => {
    (useAuth as unknown as Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(<Login />);

    expect(screen.getByRole('heading', { name: 'Admin innlogging' })).toBeInTheDocument();

    expect(screen.getByRole('img', { name: 'logo' })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
  });
});
