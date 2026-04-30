import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect } from 'vitest';
import TagComponent from '@/src/components/TagComponent';
import { TagFilterProvider } from '@/src/context/TagFilterContext';
import type { Tag } from '@/src/lib/db';

// Mock dependencies
const mockPush = vi.fn();
const mockSetSingleTag = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/src/context/TagFilterContext', () => ({
  useTagFilter: () => ({
    setSingleTag: mockSetSingleTag,
  }),
  TagFilterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('TagComponent', () => {
  const mockTag: Tag = {
    id: 'tag-123',
    name: 'Internasjonal',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rendrer tag navnet riktig', () => {
    render(
      <TagFilterProvider>
        <TagComponent tag={mockTag as Tag} />
      </TagFilterProvider>
    );

    expect(screen.getByText('Internasjonal')).toBeInTheDocument();
  });

  test('calls setSingleTag and router push when clicking tag', async () => {
    const user = userEvent.setup();

    render(
      <TagFilterProvider>
        <TagComponent tag={mockTag as Tag} />
      </TagFilterProvider>
    );

    const badge = screen.getByText('Internasjonal');
    await user.click(badge);

    expect(mockSetSingleTag).toHaveBeenCalledTimes(1);
    expect(mockSetSingleTag).toHaveBeenCalledWith(mockTag);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('er klikkbar', () => {
    render(
      <TagFilterProvider>
        <TagComponent tag={mockTag as Tag} />
      </TagFilterProvider>
    );

    const badge = screen.getByText('Internasjonal');

    expect(badge).toBeInTheDocument();
  });
});
