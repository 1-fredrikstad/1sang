import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, expect, describe } from 'vitest';
import SongOrPlaylistBox from '@/src/components/SongOrPlaylistBox';

// mock next/navigation
const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('SongOrPlaylistBox', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('navigates to correct routes when buttons are clicked', async () => {
    const user = userEvent.setup();

    render(<SongOrPlaylistBox onClose={vi.fn()} songChoice="Legg til sang" />);

    await user.click(screen.getByText('Legg til sang'));
    expect(pushMock).toHaveBeenCalledWith('/add');

    await user.click(screen.getByText('Lag ny spilleliste'));
    expect(pushMock).toHaveBeenCalledWith('/make_playlist');
  });
});
