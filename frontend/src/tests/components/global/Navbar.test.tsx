import Navbar from '@/src/components/global/Navbar';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';

const mockUsePathname = vi.fn(() => '/');
const mockUseAuth = vi.fn(() => ({ isAdmin: false }));
const mockUseSongSuggestions = vi.fn(() => ({
  data: [] as { id: string }[],
}));
const mockUseOnlineStatus = vi.fn(() => true);

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

vi.mock('@/src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/src/hooks/useData', () => ({
  useSongSuggestions: () => mockUseSongSuggestions(),
}));

vi.mock('@/src/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockUseOnlineStatus(),
}));

vi.mock('@/src/components/SongOrPlaylistBox', () => ({
  default: ({ songChoice }: { songChoice: string }) => (
    <div data-testid="song-or-playlist-box">{songChoice}</div>
  ),
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
    mockUseAuth.mockReturnValue({ isAdmin: false });
    mockUseSongSuggestions.mockReturnValue({ data: [] });
    mockUseOnlineStatus.mockReturnValue(true);
  });

  test('renders all navigation links', () => {
    render(<Navbar />);

    expect(screen.getByText('Hjem')).toBeInTheDocument();
    expect(screen.getByText('Spillelister')).toBeInTheDocument();
    expect(screen.getByText('Opprett')).toBeInTheDocument();
    expect(screen.getByText('Favoritter')).toBeInTheDocument();
    expect(screen.getByText('Innstillinger')).toBeInTheDocument();
  });

  test('marks current page as active', () => {
    mockUsePathname.mockReturnValue('/favorites');

    render(<Navbar />);

    const favoritesLink = screen.getByRole('link', { name: /favoritter/i });

    expect(favoritesLink).toHaveAttribute('aria-current', 'page');
  });

  test('opens song or playlist box when add is clicked', async () => {
    const user = userEvent.setup();

    render(<Navbar />);

    await user.click(screen.getByRole('link', { name: /opprett/i }));

    expect(screen.getByTestId('song-or-playlist-box')).toBeInTheDocument();
    expect(screen.getByText('Send inn sangforslag')).toBeInTheDocument();
  });

  test('shows admin song choice when admin clicks add', async () => {
    const user = userEvent.setup();

    mockUseAuth.mockReturnValue({ isAdmin: true });

    render(<Navbar />);

    await user.click(screen.getByRole('link', { name: /opprett/i }));

    expect(screen.getByText('Publiser sang')).toBeInTheDocument();
  });

  test('shows suggestion dot for admin when there are suggestions and user is online', () => {
    mockUseAuth.mockReturnValue({ isAdmin: true });
    mockUseSongSuggestions.mockReturnValue({
      data: [{ id: '1' }],
    });
    mockUseOnlineStatus.mockReturnValue(true);

    render(<Navbar />);

    const settingsLink = screen.getByRole('link', { name: /innstillinger/i });

    expect(settingsLink.querySelector('.bg-red-500')).toBeInTheDocument();
  });
});
