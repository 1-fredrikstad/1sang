import BackButton from '@/src/components/BackButton';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect, vi, test } from 'vitest';

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

const mockUsePathname = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockUsePathname(),
}));

describe('BackButton', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    mockUsePathname.mockClear();
  });

  test('renderes the button with svg icon', () => {
    render(<BackButton />);
    const Button = screen.getByRole('button');
    expect(Button).toBeInTheDocument();
  });

  test('calls router.back() when not on /admin', () => {
    mockUsePathname.mockReturnValue('/songs');

    render(<BackButton />);
    fireEvent.click(screen.getByRole('button', { name: /tilbake/i }));

    expect(mockRouter.back).toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
