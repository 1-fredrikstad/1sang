import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import NotFound from '@/app/not-found';

describe('NotFound page', () => {
  test('renders Campfire component on 404 page', () => {
    const { container } = render(<NotFound />);

    expect(container.querySelector('section')).toBeInTheDocument();
  });
});
