import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import EditSongPage from '../../../app/songs/[id]/edit/page';

const mockUseAuth = vi.fn();
const mockUseLiveQuery = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '123' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: () => mockUseLiveQuery(),
}));

vi.mock('@/src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/src/components/SongForm', () => ({
  default: () => <div>SongForm</div>,
}));

vi.mock('@/src/components/BackButton', () => ({
  default: () => <div>BackButton</div>,
}));

describe('EditSongPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<EditSongPage />);

    expect(screen.getByText('Laster...')).toBeInTheDocument();
  });

  test('shows access denied when user is not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    mockUseLiveQuery.mockReturnValue(undefined);

    render(<EditSongPage />);

    expect(screen.getByText('Ingen tilgang.')).toBeInTheDocument();
  });
});
