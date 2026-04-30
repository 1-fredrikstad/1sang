import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { TagListItem } from '@/src/components/admin/TagListItem';
import userEvent from '@testing-library/user-event';

const baseProps = {
  tag: { id: '1', name: 'Rock' },
  isEditing: false,
  editValue: '',
  isPending: false,
  onEditChange: vi.fn(),
  onEditConfirm: vi.fn(),
  onEditCancel: vi.fn(),
  onEditStart: vi.fn(),
  onDelete: vi.fn(),
};

describe('TagListItem', () => {
  test('renders tag name', () => {
    render(<TagListItem {...baseProps} />);
    expect(screen.getByText('Rock')).toBeInTheDocument();
  });

  test('calls onEditStart when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(<TagListItem {...baseProps} />);

    await user.click(screen.getByLabelText('Rediger Rock'));

    expect(baseProps.onEditStart).toHaveBeenCalled();
  });

  test('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(<TagListItem {...baseProps} />);

    await user.click(screen.getByLabelText('Slett Rock'));

    expect(baseProps.onDelete).toHaveBeenCalled();
  });

  test('shows input when editing', () => {
    render(<TagListItem {...baseProps} isEditing editValue="Pop" />);
    expect(screen.getByDisplayValue('Pop')).toBeInTheDocument();
  });
});
