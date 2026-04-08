import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

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
vi.mock('@/src/components/TagSelect', () => ({
  default: ({ value, onChange }: { value: unknown; onChange: (tags: unknown) => void }) => (
    <div data-testid="tag-select">Tags</div>
  ),
}));

vi.mock('@/src/components/songs/SectionInput', () => ({
  default: ({ label }: { label?: string }) => (
    <div data-testid="section-input">{label ?? 'SectionInput'}</div>
  ),
}));

import SongForm from '@/src/components/songs/SongForm';

describe('SongForm', () => {
  const mockPush = vi.fn();
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    mockRouter.push.mockClear();
    mockRouter.back.mockClear();
    vi.clearAllMocks();
  });

  it('renders form with initial heading and submit label', async () => {
    render(<SongForm heading="Add Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Add Song')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders default verse input', async () => {
    render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
    expect(screen.getByText('Vers 1')).toBeInTheDocument();
  });

  it('adds a new verse when "+ Legg til vers" is clicked', async () => {
    render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
    const addVerseButton = screen.getByText('+ Legg til vers');
    await user.click(addVerseButton);
    expect(screen.getByText('Vers 2')).toBeInTheDocument();
  });

  // TODO: tests for adding chorus and submitting - won't work now
  // it('adds chorus correctly', async () => {
  //   render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
  //   const addChorusButton = screen.getByText('+ Legg til refreng');
  //   await user.click(addChorusButton);

  //   const chorusInput = await screen.findByTestId('section-input');
  //   expect(chorusInput).toBeInTheDocument();
  // });

  // it('calls onSubmit with form data and triggers toast', async () => {
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

  it('resets form when reset button is clicked', async () => {
    render(<SongForm heading="Song" submitLabel="Save" onSubmit={mockOnSubmit} />);
    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);
    expect(screen.getByLabelText(/Tittel\*/i)).toHaveValue('');
  });
});
