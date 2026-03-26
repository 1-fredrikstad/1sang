import { vi, describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SongForm from '@/src/components/SongForm';

// Mock react toast - TODO: switch out with Radix UI sonner later
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from 'react-toastify';

describe('SongForm', () => {
  test('renders form fields', () => {
    render(<SongForm heading="Test" submitLabel="Send" onSubmit={() => {}} />);

    expect(screen.getByLabelText(/Tittel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Låtskriver/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Melodi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sangtekst/i)).toBeInTheDocument();
  });

  it('submits form with input data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SongForm heading="Test" submitLabel="Send" onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Min Sang');
    await user.type(
      screen.getByRole('textbox', { name: /sangtekst/i }),
      'Sangtekst med minst 20 bokstaver'
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Min Sang',
          lyrics: 'Sangtekst med minst 20 bokstaver',
        })
      );
    });
  });

  test('shows success toast after submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<SongForm heading="Test" submitLabel="Send" onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Min Sang');
    await user.type(
      screen.getByRole('textbox', { name: /sangtekst/i }),
      'Sangtekst med minst 20 bokstaver'
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  test('shows success toast after submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Fail'));

    render(<SongForm heading="Test" submitLabel="Send" onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /tittel/i }), 'Min Sang');
    await user.type(
      screen.getByRole('textbox', { name: /sangtekst/i }),
      'Sangtekst med minst 20 bokstaver'
    );

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test('fills form with initial values', () => {
    render(
      <SongForm
        heading="Test"
        submitLabel="Send"
        onSubmit={() => {}}
        initialValues={{ title: 'Preset' }}
      />
    );

    expect(screen.getByDisplayValue('Preset')).toBeInTheDocument();
  });
});
