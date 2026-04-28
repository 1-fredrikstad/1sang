import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { HomePage } from '@/src/components/pages/HomePage';
import { useLiveQuery } from 'dexie-react-hooks';
import { TagFilterProvider } from '@/src/context/TagFilterContext';
import type { SongListProps } from '@/src/types/songList';

const songs: SongListProps['songs'] = [
  { id: '1', title: 'Song A', chorus: '', verses: [''], has_chords: false },
  { id: '2', title: 'Song B', chorus: '', verses: [''], has_chords: false },
  { id: '3', title: 'Song C', chorus: '', verses: [''], has_chords: false },
];

// Mock dependencies
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
  usePathname: () => '/',
  useSearchParams: vi.fn(() => ({
    get: () => null,
    toString: () => '',
  })),
}));

vi.mock('@/src/components/SongBox', () => ({
  SongBox: ({ song }: { song: { id: string; title: string } }) => <div>{song.title}</div>,
}));

vi.mock('@/src/components/TagSelect', () => ({
  default: ({
    onChange,
  }: {
    value: { id: string; name: string }[];
    onChange: (tags: { id: string; name: string }[]) => void;
  }) => <button onClick={() => onChange([{ id: 'tag1', name: 'Pop' }])}>Velg tag</button>,
}));

describe('HomePage', () => {
  it('shows all songs when no tag is selected', async () => {
    vi.mocked(useLiveQuery).mockReturnValue(undefined);

    render(
      <TagFilterProvider>
        <HomePage songs={songs as never[]} isLoading={false} error={null} />
      </TagFilterProvider>
    );

    expect(await screen.findByText('Song A')).toBeInTheDocument();
    expect(await screen.findByText('Song B')).toBeInTheDocument();
    expect(await screen.findByText('Song C')).toBeInTheDocument();
  });

  it('only displays songs matching a tag', async () => {
    const user = userEvent.setup();

    vi.mocked(useLiveQuery).mockReturnValueOnce(undefined);
    vi.mocked(useLiveQuery).mockReturnValue(['1', '3']);

    render(
      <TagFilterProvider>
        <HomePage songs={songs} isLoading={false} error={null} />
      </TagFilterProvider>
    );

    const tagButton = await screen.findByText('Velg tag');
    await user.click(tagButton);

    await waitFor(() => {
      expect(screen.getByText('Song A')).toBeInTheDocument();
      expect(screen.queryByText('Song B')).not.toBeInTheDocument();
      expect(screen.getByText('Song C')).toBeInTheDocument();
    });
  });

  it('shows message when no songs match filter', async () => {
    const user = userEvent.setup();

    vi.mocked(useLiveQuery).mockReturnValue([]);

    render(
      <TagFilterProvider>
        <HomePage songs={songs as never[]} isLoading={false} error={null} />
      </TagFilterProvider>
    );

    const tagButton = await screen.findByText('Velg tag');
    await user.click(tagButton);

    await waitFor(() => {
      expect(screen.getByText(/ingen sanger matcher valgte tags/i)).toBeInTheDocument();
    });
  });
});
