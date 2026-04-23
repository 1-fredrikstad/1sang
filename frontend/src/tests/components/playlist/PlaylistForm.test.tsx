import { render, screen } from '@testing-library/react';
import { vi, expect, describe, test } from 'vitest';
import PlaylistForm from '@/src/components/playlist/PlaylistForm';
import { Song } from '@/src/lib/db';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/ui/tooltip';

// ---- mocks ----
vi.mock('sonner', async () => {
  const actual = (await vi.importActual('sonner')) as typeof import('sonner');

  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      update: vi.fn(),
      isActive: vi.fn(() => false),
    },
  };
});

vi.mock('@/src/hooks/useData', () => ({
  useSongs: () => ({
    data: [{ id: '1', title: 'Song 1', chorus: '', verses: [''] } as Song],
    error: null,
  }),
}));

type SongLite = {
  id: string;
  title: string;
  chorus: string;
  verses: string[];
};

vi.mock('@/src/components/playlist/PlaylistSongPickerModal', () => ({
  default: ({ setSongsInPlaylist }: { setSongsInPlaylist: (songs: SongLite[]) => void }) => (
    <button
      onClick={() => setSongsInPlaylist([{ id: '1', title: 'Song 1', chorus: '', verses: [] }])}
    >
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
  test('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({
      type: 'private',
      localId: 'local-1',
    });

    render(
      <TooltipProvider>
        <PlaylistForm onSubmit={onSubmit} />
      </TooltipProvider>
    );

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Test playlist');
    await user.type(screen.getByLabelText('Lag passord*'), '1234');
    await user.click(screen.getByRole('button', { name: /Velg sanger/i }));
    await user.click(screen.getByRole('button', { name: /toggle-song/i }));

    await user.click(screen.getByRole('button', { name: /opprett spilleliste/i }));

    expect(onSubmit).toHaveBeenCalled();
  });

  test('renders edit mode correctly', () => {
    render(
      <TooltipProvider>
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
      </TooltipProvider>
    );

    expect(screen.getByText(/rediger spilleliste/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /lagre endringer/i })).toBeInTheDocument();
  });

  test('shows new password field in edit mode instead of password field', () => {
    render(
      <TooltipProvider>
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
      </TooltipProvider>
    );

    expect(screen.getByLabelText(/nytt passord/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^passord/i)).not.toBeInTheDocument();
  });

  test('uses initial values in edit mode', () => {
    render(
      <TooltipProvider>
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
      </TooltipProvider>
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

    render(
      <TooltipProvider>
        <PlaylistForm onSubmit={onSubmit} />
      </TooltipProvider>
    );

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Test playlist');
    await user.type(screen.getByLabelText('Lag passord*'), '1234');

    await user.click(screen.getByRole('button', { name: /Velg sanger/i }));
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
