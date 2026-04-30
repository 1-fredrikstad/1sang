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

// Mock TagSelect and SectionInput with proper prop types
// vi.mock('@/src/components/TagSelect', () => ({
//   default: ({ value, onChange }: { value: unknown; onChange: (tags: unknown) => void }) => (
//     <div data-testid="tag-select">Tags</div>
//   ),
// }));

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

  // TODO: tests for adding chorus and submitting - won't work now
  // test('adds chorus correctly', async () => {
  //   render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
  //   const addChorusButton = screen.getByText('+ Legg til refreng');
  //   await user.click(addChorusButton);

  //   const chorusInput = await screen.findByTestId('section-input');
  //   expect(chorusInput).toBeInTheDocument();
  // });

  // test('calls onSubmit with form data and triggers toast', async () => {
  //   render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);

  //   const titleInput = screen.getByLabelText(/Tittel\*/i);
  //   await user.type(titleInput, 'My Song');

  //   const submitButton = screen.getByText('Save');
  //   await user.click(submitButton);

  //   await new Promise(process.nextTick);

  //   expect(mockOnSubmit).toHaveBeenCalled();
  //   expect(toast.success).toHaveBeenCalled();
  //   expect(mockPush).toHaveBeenCalledWith('/');
  // });

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
