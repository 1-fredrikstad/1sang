import { describe, expect, vi, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SectionInput from '@/src/components/SectionInput';
import type { UseFormRegisterReturn } from 'react-hook-form';

describe('SectionInput', () => {
  const mockRegister: UseFormRegisterReturn = {
    name: 'test',
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ref: vi.fn(),
  };

  test('renders label if provided', () => {
    render(
      <SectionInput
        label="My Label"
        register={mockRegister}
        removeText="test"
        charCount={0}
        limit={100}
      />
    );
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  test('renders textarea and shows char count', () => {
    render(<SectionInput register={mockRegister} removeText="test" charCount={42} limit={100} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('42 / 100')).toBeInTheDocument();
  });

  test('shows error if provided', () => {
    render(
      <SectionInput
        register={mockRegister}
        removeText="test"
        charCount={0}
        limit={100}
        error="Required"
      />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  test('calls onRemove when remove button clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <SectionInput
        register={mockRegister}
        removeText="test"
        charCount={0}
        limit={100}
        removable
        onRemove={onRemove}
      />
    );

    const button = screen.getByRole('button', { name: /Slett test/i });
    await user.click(button);
    expect(onRemove).toHaveBeenCalled();
  });
});
