import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { HomePage } from '@/src/components/pages/HomePage';
import { useLiveQuery } from 'dexie-react-hooks';
import { TagFilterProvider } from '@/src/context/TagFilterContext';

// Mock dependencies
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: () => null,
    toString: () => '',
  }),
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
  const songs = [
    { id: '1', title: 'Song A' },
    { id: '2', title: 'Song B' },
    { id: '3', title: 'Song C' },
  ];

  it('viser alle sanger når ingen tag er valgt', () => {
    vi.mocked(useLiveQuery).mockReturnValue([]);

    render(
      <TagFilterProvider>
        <HomePage songs={songs as never[]} isLoading={false} error={null} />
      </TagFilterProvider>
    );
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText('Song B')).toBeInTheDocument();
    expect(screen.getByText('Song C')).toBeInTheDocument();
  });

  it('viser bare sanger som matcher valgt tag', async () => {
    const user = userEvent.setup();

    vi.mocked(useLiveQuery).mockImplementation((_, deps) => {
      const selectedTags = deps?.[0] as { id: string; name: string }[];

      if (!selectedTags || selectedTags.length === 0) {
        return [];
      }

      // Simulate that tag 'tag1' matches song 1 and 3
      return ['1', '3'];
    });

    render(
      <TagFilterProvider>
        <HomePage songs={songs as never[]} isLoading={false} error={null} />
      </TagFilterProvider>
    );

    await user.click(screen.getByText('Velg tag'));

    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.queryByText('Song B')).not.toBeInTheDocument();
    expect(screen.getByText('Song C')).toBeInTheDocument();
  });

  it('viser melding når ingen sanger matcher filteret', async () => {
    const user = userEvent.setup();

    vi.mocked(useLiveQuery).mockReturnValue(['999']); // Non-existing song id

    render(
      <TagFilterProvider>
        <HomePage songs={songs as never[]} isLoading={false} error={null} />
      </TagFilterProvider>
    );

    await user.click(screen.getByText('Velg tag'));

    expect(screen.getByText(/ingen sanger matcher valgte tags/i)).toBeInTheDocument();
  });
});
