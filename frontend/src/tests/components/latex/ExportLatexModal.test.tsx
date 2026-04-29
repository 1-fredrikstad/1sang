import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExportLatexModal from '@/src/components/latex/ExportLatexModal';

const { mockUseSongPicker } = vi.hoisted(() => ({
  mockUseSongPicker: vi.fn(),
}));

vi.mock('@/src/hooks/useSongPicker', () => ({
  useSongPicker: mockUseSongPicker,
}));

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

const defaultPickerState = {
  search: '',
  setSearch: vi.fn(),
  filteredSongs: [{ song: mockSongs[0], score: 10 }],
  isSongAdded: () => false,
  toggleSong: vi.fn(),
  clearAll: vi.fn(),
  selectAll: vi.fn(),
  allSelected: false,
  noneSelected: false,
  selectedCount: 1,
};

describe('ExportLatexModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSongPicker.mockReturnValue(defaultPickerState);
  });

  it('calls generateLatex with selected songs and total count on export', async () => {
    const user = userEvent.setup();
    const generateLatex = vi.fn();

    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={generateLatex}
      />
    );

    await user.click(screen.getByRole('button', { name: /eksporter/i }));

    expect(generateLatex).toHaveBeenCalledWith(expect.any(Array), mockSongs.length);
  });

  it('shows selected count in export button label', () => {
    mockUseSongPicker.mockReturnValue({ ...defaultPickerState, selectedCount: 3 });

    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /eksporter \(3\)/i })).toBeInTheDocument();
  });

  it('disables export button when no songs selected', () => {
    mockUseSongPicker.mockReturnValue({
      ...defaultPickerState,
      selectedCount: 0,
      noneSelected: true,
    });

    render(
      <ExportLatexModal
        open={true}
        onOpenChange={vi.fn()}
        songs={mockSongs}
        generateLatex={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /eksporter/i })).toBeDisabled();
  });
});
