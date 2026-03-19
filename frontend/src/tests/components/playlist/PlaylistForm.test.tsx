import { render, screen, fireEvent } from '@testing-library/react';
import { vi, expect, describe, test } from 'vitest';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { Song } from '@/src/lib/db';
import { ExtendedSongListProps } from '@/src/components/playlist/SongList';
import userEvent from '@testing-library/user-event';

// ---- mocks ----
const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock('@/src/hooks/useData', () => ({
  useSongs: () => ({
    data: [{ id: '1', title: 'Song 1' }],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/src/components/playlist/SongList', () => ({
  default: ({ onToggleSong }: ExtendedSongListProps) => (
    <button onClick={() => onToggleSong({ id: '1', title: 'Song 1' } as Song)}>toggle-song</button>
  ),
}));

type SwitchProps = {
  onCheckedChange: (value: boolean) => void;
};

vi.mock('@/src/components/ui/switch', () => ({
  Switch: ({ onCheckedChange }: SwitchProps) => (
    <button onClick={() => onCheckedChange(true)}>switch</button>
  ),
}));

// ---- tests ----
describe('PlaylistForm', () => {
  test('adds a song and shows success toast', () => {
    render(<PlaylistForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByText('toggle-song'));

    expect(mockToastSuccess).toHaveBeenCalledWith('Sang lagt til');
  });

  test('removes a song and shows error toast', () => {
    render(<PlaylistForm onSubmit={vi.fn()} />);

    const toggle = screen.getByText('toggle-song');

    fireEvent.click(toggle); // add
    fireEvent.click(toggle); // remove

    expect(mockToastError).toHaveBeenCalledWith('Sang fjernet');
  });

  test('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<PlaylistForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Test playlist');
    await user.type(screen.getByRole('textbox', { name: /passord/i }), '1234');

    await user.click(screen.getByRole('button', { name: /opprett spilleliste/i }));

    expect(onSubmit).toHaveBeenCalled();
  });
});
