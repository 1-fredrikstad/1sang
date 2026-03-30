import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { HomePage } from '@/src/components/pages/HomePage';
import { useLiveQuery } from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
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

    render(<HomePage songs={songs as never[]} isLoading={false} error={null} />);

    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText('Song B')).toBeInTheDocument();
    expect(screen.getByText('Song C')).toBeInTheDocument();
  });

  it('viser bare sanger som matcher valgt tag', () => {
    vi.mocked(useLiveQuery).mockImplementation((_, deps) => {
      const selectedTags = deps?.[0] as { id: string; name: string }[];

      if (!selectedTags || selectedTags.length === 0) {
        return [];
      }

      return ['1', '3'];
    });

    render(<HomePage songs={songs as never[]} isLoading={false} error={null} />);

    fireEvent.click(screen.getByText('Velg tag'));

    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.queryByText('Song B')).not.toBeInTheDocument();
    expect(screen.getByText('Song C')).toBeInTheDocument();
  });
});
