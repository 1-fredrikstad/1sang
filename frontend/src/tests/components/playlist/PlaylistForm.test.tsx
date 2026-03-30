import { render, screen } from '@testing-library/react';
import { vi, expect, describe, test } from 'vitest';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { Song } from '@/src/lib/db';
import { ExtendedSongListProps } from '@/src/components/playlist/SongList';
import userEvent from '@testing-library/user-event';

// ---- mocks ----
vi.mock('react-toastify', () => {
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();

  return {
    __esModule: true,
    toast: {
      success: mockToastSuccess,
      error: mockToastError,
      update: vi.fn(),
      isActive: vi.fn(() => false),
    },
    mockToastSuccess,
    mockToastError,
  };
});

vi.mock('@/src/hooks/useData', () => ({
  useSongs: () => ({
    data: [{ id: '1', title: 'Song 1', lyrics: '' } as Song],
    isLoading: false,
    error: null,
  }),
}));

vi.mock('@/src/components/playlist/SongList', () => ({
  __esModule: true,
  default: ({ onToggleSong }: ExtendedSongListProps) => (
    <button onClick={() => onToggleSong({ id: '1', title: 'Song 1', lyrics: '' })}>
      toggle-song
    </button>
  ),
}));

type SwitchProps = {
  checked?: boolean;
  onCheckedChange: (value: boolean) => void;
};

vi.mock('@/src/components/ui/switch', () => ({
  __esModule: true,
  Switch: ({ onCheckedChange }: SwitchProps) => (
    <button onClick={() => onCheckedChange(true)}>switch</button>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/',
}));

// ---- tests ----
describe('PlaylistForm', () => {
  test('adds a song and shows success toast', async () => {
    const user = userEvent.setup();
    render(<PlaylistForm onSubmit={vi.fn()} />);

    const toggle = screen.getByText('toggle-song');

    await user.click(toggle);

    // @ts-expect-error access mock inside vi.mock
    const { mockToastSuccess } = await import('react-toastify');

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Sang lagt til',
      expect.objectContaining({ toastId: 'playlist-toast' })
    );
  });

  test('removes a song and shows error toast', async () => {
    const user = userEvent.setup();
    render(<PlaylistForm onSubmit={vi.fn()} />);

    const toggle = screen.getByText('toggle-song');

    await user.click(toggle); // add
    await user.click(toggle); // remove

    // @ts-expect-error access mock inside vi.mock
    const { mockToastError } = await import('react-toastify');

    expect(mockToastError).toHaveBeenCalledWith(
      'Sang fjernet',
      expect.objectContaining({ toastId: 'playlist-toast' })
    );
  });

  test('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({
      type: 'private',
      localId: 'local-1',
    });

    render(<PlaylistForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Test playlist');
    await user.type(screen.getByRole('textbox', { name: /passord/i }), '1234');

    await user.click(screen.getByRole('button', { name: /opprett spilleliste/i }));

    expect(onSubmit).toHaveBeenCalled();
  });
});
