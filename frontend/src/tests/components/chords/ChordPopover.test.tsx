import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChordPopover } from '@/src/components/chords/ChordPopover';

describe('ChordPopover', () => {
  test('does not render when closed', () => {
    const { container } = render(
      <ChordPopover
        isOpen={false}
        token={{ word: 'hei' }}
        onClose={vi.fn()}
        onChordSelect={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('calls onChordSelect when a preset chord is clicked', async () => {
    const onChordSelect = vi.fn();

    render(
      <ChordPopover
        isOpen
        token={{ word: 'hei' }}
        onClose={vi.fn()}
        onChordSelect={onChordSelect}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'C' }));

    expect(onChordSelect).toHaveBeenCalledWith('C');
  });

  test('adds custom chord on Enter and clears input', async () => {
    const onChordSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ChordPopover
        isOpen
        token={{ word: 'hei' }}
        onClose={vi.fn()}
        onChordSelect={onChordSelect}
      />
    );

    const input = screen.getByPlaceholderText('Egen akkord');
    await user.type(input, '  F#m7  {enter}');

    expect(onChordSelect).toHaveBeenCalledWith('F#m7');
    expect(input).toHaveValue('');
  });

  test('removes all chords and closes when remove is clicked', async () => {
    const onChordSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <ChordPopover
        isOpen
        token={{ word: 'hei', chords: ['C', 'G'] }}
        onClose={onClose}
        onChordSelect={onChordSelect}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Fjern akkord' }));

    expect(onChordSelect).toHaveBeenCalledWith(undefined);
    expect(onClose).toHaveBeenCalled();
  });
});
