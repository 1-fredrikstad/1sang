import { render, screen } from '@testing-library/react';
import { vi, expect, describe, test } from 'vitest';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { Song } from '@/src/lib/db';
import { ExtendedSongListProps } from '@/src/components/playlist/SongList';
import userEvent from '@testing-library/user-event';

// ---- mocks ----
vi.mock('sonner', () => {
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
    data: [{ id: '1', title: 'Song 1', chorus: '', verses: [''] } as Song],
    error: null,
  }),
}));

vi.mock('@/src/components/playlist/SongList', () => ({
  __esModule: true,
  default: ({ onToggleSong }: ExtendedSongListProps) => (
    <button onClick={() => onToggleSong({ id: '1', title: 'Song 1', chorus: '', verses: [''] })}>
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
}));

// ---- tests ----
describe('PlaylistForm', () => {
  test('adds a song and shows success toast', async () => {
    const user = userEvent.setup();
    render(<PlaylistForm onSubmit={vi.fn()} />);

    const toggle = screen.getByText('toggle-song');

    await user.click(toggle);

    // @ts-expect-error access mock inside vi.mock
    const { mockToastSuccess } = await import('sonner');

    expect(mockToastSuccess).toHaveBeenCalledWith('Sang lagt til');
  });

  test('removes a song and shows error toast', async () => {
    const user = userEvent.setup();
    render(<PlaylistForm onSubmit={vi.fn()} />);

    const toggle = screen.getByText('toggle-song');

    await user.click(toggle); // add
    await user.click(toggle); // remove

    // @ts-expect-error access mock inside vi.mock
    const { mockToastError } = await import('sonner');

    expect(mockToastError).toHaveBeenCalledWith('Sang fjernet');
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

  test('renders edit mode correctly', () => {
    render(
      <PlaylistForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{
          title: 'Min spilleliste',
          password: '',
          newPassword: '',
          songsInPlaylist: [],
          isPublic: false,
          duration: 604800,
        }}
      />
    );

    expect(screen.getByText(/rediger spilleliste/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lagre endringer/i })).toBeInTheDocument();
  });

  test('renders edit mode correctly', () => {
    render(
      <PlaylistForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{
          title: 'Min spilleliste',
          password: '',
          newPassword: '',
          songsInPlaylist: [],
          isPublic: false,
          duration: 604800,
        }}
      />
    );

    expect(screen.getByText(/rediger spilleliste/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lagre endringer/i })).toBeInTheDocument();
  });

  test('shows new password field in edit mode instead of password field', () => {
    render(
      <PlaylistForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{
          title: 'Min spilleliste',
          password: '',
          newPassword: '',
          songsInPlaylist: [],
          isPublic: false,
          duration: 604800,
        }}
      />
    );

    expect(screen.getByLabelText(/nytt passord/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^passord/i)).not.toBeInTheDocument();
  });

  test('uses initial values in edit mode', () => {
    render(
      <PlaylistForm
        onSubmit={vi.fn()}
        mode="edit"
        initialValues={{
          title: 'Eksisterende spilleliste',
          password: '',
          newPassword: '',
          songsInPlaylist: [],
          isPublic: false,
          duration: 604800,
        }}
      />
    );

    expect(screen.getByDisplayValue('Eksisterende spilleliste')).toBeInTheDocument();
  });

  test('does not submit multiple times when submit is clicked repeatedly during lag', async () => {
    const user = userEvent.setup();

    let resolveSubmit!: (value: unknown) => void;
    const slowPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });

    const onSubmit = vi.fn().mockReturnValue(slowPromise);

    render(<PlaylistForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Test playlist');
    await user.type(screen.getByRole('textbox', { name: /passord/i }), '1234');

    await user.click(screen.getByRole('button', { name: /toggle-song/i }));

    const submitButton = screen.getByRole('button', { name: /opprett spilleliste/i });

    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.click(submitButton);
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit({ type: 'private', localId: 'local-1' });
  });
});
