import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TagListItem } from '@/src/components/admin/TagListItem';

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
  it('renders tag name', () => {
    render(<TagListItem {...baseProps} />);
    expect(screen.getByText('Rock')).toBeInTheDocument();
  });

  it('calls onEditStart when edit button is clicked', () => {
    render(<TagListItem {...baseProps} />);
    fireEvent.click(screen.getByLabelText('Rediger Rock'));
    expect(baseProps.onEditStart).toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TagListItem {...baseProps} />);
    fireEvent.click(screen.getByLabelText('Slett Rock'));
    expect(baseProps.onDelete).toHaveBeenCalled();
  });

  it('shows input when editing', () => {
    render(<TagListItem {...baseProps} isEditing editValue="Pop" />);
    expect(screen.getByDisplayValue('Pop')).toBeInTheDocument();
  });
});
