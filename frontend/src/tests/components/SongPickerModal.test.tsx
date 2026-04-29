import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongPickerModal from '@/src/components/SongPickerModal';

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
  noneSelected: true,
  selectedCount: 0,
};

const defaultProps = {
  songs: mockSongs,
  open: true,
  onOpenChange: vi.fn(),
  title: 'Test modal',
  description: 'Test beskrivelse',
  onSave: vi.fn(),
};

describe('SongPickerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSongPicker.mockReturnValue(defaultPickerState);
  });

  it('renders when open is true', () => {
    render(<SongPickerModal {...defaultProps} />);
    expect(screen.getByText('Test modal')).toBeInTheDocument();
    expect(screen.getByText('Test beskrivelse')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SongPickerModal {...defaultProps} open={false} />);
    expect(screen.queryByText('Test modal')).not.toBeInTheDocument();
  });

  it('save button is disabled when no songs are selected', () => {
    render(<SongPickerModal {...defaultProps} saveButtonLabel="Lagre" />);
    expect(screen.getByRole('button', { name: /lagre/i })).toBeDisabled();
  });

  it('save button is enabled when songs are selected', () => {
    mockUseSongPicker.mockReturnValue({
      ...defaultPickerState,
      selectedCount: 1,
      noneSelected: false,
    });

    render(<SongPickerModal {...defaultProps} saveButtonLabel="Lagre" />);
    expect(screen.getByRole('button', { name: /lagre/i })).toBeEnabled();
  });

  it('calls onSave and closes when save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onOpenChange = vi.fn();

    mockUseSongPicker.mockReturnValue({
      ...defaultPickerState,
      selectedCount: 1,
      noneSelected: false,
    });

    render(
      <SongPickerModal
        {...defaultProps}
        onSave={onSave}
        onOpenChange={onOpenChange}
        saveButtonLabel="Lagre"
      />
    );

    await user.click(screen.getByRole('button', { name: /lagre/i }));

    expect(onSave).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('clears selection and closes when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<SongPickerModal {...defaultProps} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: /avbryt/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders dynamic save button label', () => {
    mockUseSongPicker.mockReturnValue({
      ...defaultPickerState,
      selectedCount: 3,
      noneSelected: false,
    });

    render(
      <SongPickerModal {...defaultProps} saveButtonLabel={(count) => `Eksporter (${count})`} />
    );

    expect(screen.getByRole('button', { name: /eksporter \(3\)/i })).toBeInTheDocument();
  });
});
