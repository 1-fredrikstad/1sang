import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import EditSongPage from '../../../app/songs/[slug]/edit/page';

// samling av mock funksjoner
const {
  mockUseAuth,
  mockUseLiveQuery,
  mockPush,
  mockSongForm,
  mockDelete,
  mockBulkAdd,
  mockUpdate,
  mockGetSession,
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseLiveQuery: vi.fn(),
  mockPush: vi.fn(),
  mockSongForm: vi.fn(),
  mockDelete: vi.fn(),
  mockBulkAdd: vi.fn(),
  mockUpdate: vi.fn(),
  mockGetSession: vi.fn(),
}));

type Tag = {
  id: string;
  name: string;
};

type SongFormSubmitData = {
  title: string;
  melody?: string;
  author?: string;
  lyrics: string;
  tags?: string[];
};

type SongFormProps = {
  initialValues: {
    title: string;
    melody: string;
    author: string;
    lyrics: string;
    tags?: Tag[];
  };
  onSubmit: (data: SongFormSubmitData) => void;
};

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'min-sang' }),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: mockUseLiveQuery,
}));

vi.mock('@/src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/src/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

// mock av dataen
vi.mock('@/src/lib/db', () => ({
  db: {
    songs: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          first: vi.fn(),
        })),
      })),
      update: mockUpdate,
    },
    song_tags: {
      where: vi.fn(() => ({
        equals: vi.fn(() => ({
          toArray: vi.fn(),
          delete: mockDelete,
        })),
      })),
      bulkAdd: mockBulkAdd,
    },
    tags: {
      where: vi.fn(() => ({
        anyOf: vi.fn(() => ({
          toArray: vi.fn(),
        })),
      })),
    },
  },
}));

vi.mock('@/src/components/SongForm', () => ({
  default: (props: SongFormProps) => {
    mockSongForm(props);

    return (
      <div>
        <div>SongForm</div>
        <div data-testid="initial-tags">
          {props.initialValues.tags?.map((tag) => tag.name).join(', ')}
        </div>
        <button
          onClick={() =>
            props.onSubmit({
              title: 'Ny tittel',
              melody: 'Ny melodi',
              author: 'Ny forfatter',
              lyrics: 'Ny tekst',
              tags: ['tag2', 'tag3'],
            })
          }
        >
          Lagre
        </button>
      </div>
    );
  },
}));

vi.mock('@/src/components/BackButton', () => ({
  default: () => <div>BackButton</div>,
}));

vi.mock('@/src/components/DeleteSongButton', () => ({
  DeleteSongButton: () => <div>DeleteSongButton</div>,
}));

describe('EditSongPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-token',
        },
      },
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            id: '123',
            slug: 'ny-tittel',
          },
        }),
      })
    );
  });

  test('shows access denied when user is not admin', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    });
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<EditSongPage />);

    expect(screen.getByText('Ingen tilgang.')).toBeInTheDocument();
  });

  // sjekker at EditSong sender inn en helt lik array
  test('passes existing tags to SongForm initialValues', () => {
    mockUseAuth.mockReturnValue({
      isAdmin: true,
    });

    const song = {
      id: '123',
      title: 'Min sang',
      slug: 'min-sang',
      melody: 'Melodi',
      author: 'Forfatter',
      lyrics: 'Tekst',
    };

    const songTags: Tag[] = [
      { id: 'tag1', name: 'Rock' },
      { id: 'tag2', name: 'Pop' },
    ];

    // sjekker at første useLiveQuery returnerer sang og andre tags
    let call = 0;
    mockUseLiveQuery.mockImplementation(() => {
      call += 1;
      if (call === 1) return song;
      if (call === 2) return songTags;
      return undefined;
    });

    render(<EditSongPage />);

    expect(screen.getByText('SongForm')).toBeInTheDocument();
    expect(screen.getByTestId('initial-tags')).toHaveTextContent('Rock, Pop');
    expect(mockSongForm.mock.calls[0][0].initialValues.tags).toEqual(songTags);
  });

  test('updates tags when form is submitted', async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({
      isAdmin: true,
    });

    const song = {
      id: '123',
      title: 'Min sang',
      slug: 'min-sang',
      melody: 'Melodi',
      author: 'Forfatter',
      lyrics: 'Tekst',
    };

    const songTags: Tag[] = [
      { id: 'tag1', name: 'Rock' },
      { id: 'tag2', name: 'Pop' },
    ];

    let call = 0;
    mockUseLiveQuery.mockImplementation(() => {
      call += 1;
      if (call === 1) return song;
      if (call === 2) return songTags;
      return undefined;
    });

    render(<EditSongPage />);

    expect(screen.getByText('SongForm')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lagre' }));

    expect(mockGetSession).toHaveBeenCalled();

    expect(fetch).toHaveBeenCalledWith('/api/songs/123', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer fake-token',
      },
      body: JSON.stringify({
        title: 'Ny tittel',
        melody: 'Ny melodi',
        author: 'Ny forfatter',
        lyrics: 'Ny tekst',
        tags: ['tag2', 'tag3'],
      }),
    });

    expect(mockUpdate).toHaveBeenCalledWith('123', {
      title: 'Ny tittel',
      slug: 'ny-tittel',
      melody: 'Ny melodi',
      author: 'Ny forfatter',
      lyrics: 'Ny tekst',
    });

    expect(mockDelete).toHaveBeenCalled();

    expect(mockBulkAdd).toHaveBeenCalledWith([
      { song_id: '123', tag_id: 'tag2' },
      { song_id: '123', tag_id: 'tag3' },
    ]);

    expect(mockPush).toHaveBeenCalledWith('/songs/ny-tittel');
  });
});
