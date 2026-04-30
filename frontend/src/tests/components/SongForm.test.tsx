import { describe, expect, vi, beforeEach, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock next/router and toast
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/src/components/songs/SectionInput', () => ({
  default: ({ label }: { label?: string }) => (
    <div data-testid="section-input">{label ?? 'SectionInput'}</div>
  ),
}));

import SongForm from '@/src/components/songs/SongForm';

describe('SongForm', () => {
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    vi.clearAllMocks();
  });

  test('renders form with initial heading and submit label', async () => {
    render(
      <TooltipProvider>
        <SongForm heading="Legg til sang" submitLabel="Lagre" onSubmit={mockOnSubmit} />
      </TooltipProvider>
    );
    expect(screen.getByText('Legg til sang')).toBeInTheDocument();
    expect(screen.getByText('Lagre')).toBeInTheDocument();
  });

  test('renders default verse input', async () => {
    render(
      <TooltipProvider>
        <SongForm heading="Sang" submitLabel="Lagre" onSubmit={mockOnSubmit} />
      </TooltipProvider>
    );
    expect(screen.getByText('Vers 1')).toBeInTheDocument();
  });

  test('adds a new verse when "+ Legg til vers" is clicked', async () => {
    render(
      <TooltipProvider>
        <SongForm heading="Sang" submitLabel="Lagre" onSubmit={mockOnSubmit} />
      </TooltipProvider>
    );
    const addVerseButton = screen.getByText('+ Legg til vers');
    await user.click(addVerseButton);
    expect(screen.getByText('Vers 2')).toBeInTheDocument();
  });

  test('resets form when reset button is clicked', async () => {
    render(
      <TooltipProvider>
        <SongForm heading="Sang" submitLabel="Lagre" onSubmit={mockOnSubmit} />
      </TooltipProvider>
    );
    const resetButton = screen.getByText('Nullstill');
    await user.click(resetButton);
    expect(screen.getByLabelText(/Tittel\*/i)).toHaveValue('');
  });
});
