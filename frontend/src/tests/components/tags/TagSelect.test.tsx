import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TagSelect from '@/src/components/TagSelect';

const mockOnChange = vi.fn();

type ChildrenProps = {
  children: ReactNode;
};

type CheckboxItemProps = {
  children: ReactNode;
  onCheckedChange?: () => void;
};

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: ChildrenProps & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: ChildrenProps) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: ChildrenProps) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: ChildrenProps) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: ChildrenProps) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children, onCheckedChange }: CheckboxItemProps) => (
    <button onClick={onCheckedChange}>{children}</button>
  ),
}));

describe('TagSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          data: [
            { id: '1', name: 'Rock' },
            { id: '2', name: 'Pop' },
            { id: '3', name: 'Jazz' },
          ],
        }),
      })
    );
  });

  test('renders selected tag names in button', async () => {
    render(
      <TagSelect
        value={[
          { id: '1', name: 'Rock' },
          { id: '2', name: 'Pop' },
        ]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('button', { name: 'Rock, Pop' })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('renders placeholder when no tags are selected', async () => {
    render(<TagSelect value={[]} onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: 'Velg tags' })).toBeInTheDocument();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('fetches and renders tags', async () => {
    render(<TagSelect value={[]} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Rock')).toBeInTheDocument();
      expect(screen.getByText('Pop')).toBeInTheDocument();
      expect(screen.getByText('Jazz')).toBeInTheDocument();
    });
  });

  test('calls onChange with added tag when selecting a tag', async () => {
    const user = userEvent.setup();

    render(<TagSelect value={[]} onChange={mockOnChange} />);

    await waitFor(() => {
      expect(screen.getByText('Rock')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Rock'));

    expect(mockOnChange).toHaveBeenCalledWith([{ id: '1', name: 'Rock' }]);
  });

  test('calls onChange with tag removed when unselecting a tag', async () => {
    const user = userEvent.setup();

    render(
      <TagSelect
        value={[
          { id: '1', name: 'Rock' },
          { id: '2', name: 'Pop' },
        ]}
        onChange={mockOnChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Rock')).toBeInTheDocument();
      expect(screen.getByText('Pop')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Rock'));

    expect(mockOnChange).toHaveBeenCalledWith([{ id: '2', name: 'Pop' }]);
  });
});
