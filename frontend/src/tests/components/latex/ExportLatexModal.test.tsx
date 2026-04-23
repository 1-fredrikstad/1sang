import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportLatexModal from '@/src/components/latex/ExportLatexModal';

// Mocks
const { mockGenerateLatex, mockUseSongPicker } = vi.hoisted(() => ({
  mockGenerateLatex: vi.fn(),
  mockUseSongPicker: vi.fn(),
}));

vi.mock('@/src/components/latex/GenerateLatex', () => ({
  generateLatex: mockGenerateLatex,
}));

vi.mock('@/src/hooks/useSongPicker', () => ({
  useSongPicker: mockUseSongPicker,
}));

describe('ExportLatexModal', () => {
  const mockSongs = [
    {
      id: '1',
      title: 'Test sang',
      melody: 'Test melodi',
      verses: ['Vers 1'],
      chorus: 'Refreng',
      has_chords: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSongPicker.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      filteredSongs: [{ song: mockSongs[0], score: 10 }],
      isSongAdded: () => true,
      toggleSong: vi.fn(),
      clearAll: vi.fn(),
      selectAll: vi.fn(),
      allSelected: true,
      noneSelected: false,
      selectedCount: 1,
    });
  });

  it('renders when open is true', () => {
    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={mockGenerateLatex}
      />
    );

    expect(screen.getByText(/eksporter til latex/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ExportLatexModal
        open={false}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={mockGenerateLatex}
      />
    );

    expect(screen.queryByText(/eksporter til latex/i)).not.toBeInTheDocument();
  });

  it('calls GenerateLatex when clicking export', async () => {
    const user = userEvent.setup();

    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={mockGenerateLatex}
      />
    );

    await user.click(screen.getByRole('button', { name: /eksporter/i }));

    expect(mockGenerateLatex).toHaveBeenCalledWith(expect.any(Array), mockSongs.length);
  });

  it('disables export button when no songs selected', () => {
    mockUseSongPicker.mockReturnValue({
      search: '',
      setSearch: vi.fn(),
      filteredSongs: [],
      isSongAdded: () => false,
      toggleSong: vi.fn(),
      clearAll: vi.fn(),
      selectAll: vi.fn(),
      allSelected: false,
      noneSelected: true,
      selectedCount: 0,
    });

    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={mockGenerateLatex}
      />
    );

    expect(screen.getByRole('button', { name: /eksporter/i })).toBeDisabled();
  });
});
