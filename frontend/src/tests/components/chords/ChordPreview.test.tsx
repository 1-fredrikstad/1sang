import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChordPreview from '@/src/components/chords/ChordPreview';

describe('ChordPreview', () => {
  test('opens popover and applies selected chord to section value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ChordPreview
        sections={[
          {
            label: 'Vers 1',
            value: 'hello world',
            onChange,
          },
        ]}
      />
    );

    await user.click(screen.getByText('hello'));
    await user.click(screen.getByRole('button', { name: 'C' }));

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('[C]'));
  });

  test('closes popover on outside click', async () => {
    const user = userEvent.setup();

    render(
      <ChordPreview
        sections={[
          {
            label: 'Vers 1',
            value: 'hello world',
            onChange: vi.fn(),
          },
        ]}
      />
    );

    await user.click(screen.getByText('hello'));
    expect(screen.getByPlaceholderText('Egen akkord')).toBeInTheDocument();

    await user.click(document.body);

    expect(screen.queryByPlaceholderText('Egen akkord')).not.toBeInTheDocument();
  });
});
