import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MakeIntoLatex from '@/src/components/MakeIntoLatex';

// Mock sonner-toast
const { mockToastError } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
  },
}));

// Mock songdata
const mockSongs = [
  {
    title: 'Test sang',
    melody: 'Test melodi',
    verses: ['Dette er vers 1', 'Dette er vers 2'],
    chorus: 'Refreng',
  },
];

describe('MakeIntoLatex', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = mockFetch;

    // Mock URL for download
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('render button with correct text', () => {
    render(<MakeIntoLatex />);
    expect(screen.getByRole('button', { name: /last ned latex/i })).toBeInTheDocument();
  });

  it('call fetch on /api/songs on button click', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockSongs }),
    });

    render(<MakeIntoLatex />);

    await user.click(screen.getByRole('button', { name: /last ned latex/i }));

    expect(mockFetch).toHaveBeenCalledWith('/api/songs');
  });

  it('start download on successfull fetch', async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockSongs }),
    });

    render(<MakeIntoLatex />);

    await user.click(screen.getByRole('button', { name: /last ned latex/i }));

    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  it('throws toast error and logs to console when API returns !ok', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFetch.mockResolvedValue({
      ok: false,
    });

    render(<MakeIntoLatex />);

    await user.click(screen.getByRole('button', { name: /last ned latex/i }));

    expect(mockToastError).toHaveBeenCalledWith('Kunne ikke laste ned LaTex');

    expect(consoleSpy).toHaveBeenCalledWith('Feil ved generering av LaTex:', expect.any(Error));

    consoleSpy.mockRestore();
  });
});
