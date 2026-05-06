import Header from '@/src/components/global/Header';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    width,
    height,
    className,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => {
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} />;
  },
}));

describe('Header', () => {
  test('renders logo and title', () => {
    render(<Header />);

    expect(screen.getByAltText('Scout Logo')).toBeInTheDocument();
    expect(screen.getByText('Sanger')).toBeInTheDocument();
    expect(screen.getByText('under')).toBeInTheDocument();
    expect(screen.getByText('liljen')).toBeInTheDocument();
  });

  test('logo/title link points to homepage', () => {
    render(<Header />);

    const link = screen.getByRole('link', { name: /go to homepage/i });

    expect(link).toHaveAttribute('href', '/');
  });

  test('clicking the header link goes to homepage', async () => {
    const user = userEvent.setup();

    render(<Header />);

    const link = screen.getByRole('link', { name: /go to homepage/i });
    await user.click(link);

    expect(link).toHaveAttribute('href', '/');
  });
});
