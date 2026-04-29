import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi, beforeEach, afterEach } from 'vitest';
import Campfire from '@/src/components/campfire/Campfire';

const playMock = vi.fn(() => Promise.resolve());
class AudioMock {
  src: string;
  volume = 1;
  currentTime = 0;

  play = playMock;
  pause = vi.fn();

  constructor(src: string) {
    this.src = src;
  }
}

(globalThis as unknown as { Audio: typeof AudioMock }).Audio = AudioMock;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('Campfire', () => {
  test('plays sound and adds boost class on click', async () => {
    render(<Campfire message="" />);

    const fireImage = screen.getByAltText('Fire');
    const container = fireImage.closest('section') as HTMLElement;

    fireEvent.click(container);

    expect(playMock).toHaveBeenCalled();
    expect(fireImage.className).toContain('fire-boost');
  });

  test('resets after 7.5 seconds', async () => {
    render(<Campfire message="" />);

    const fireImage = screen.getByAltText('Fire');
    const container = fireImage.closest('section') as HTMLElement;

    fireEvent.click(container);

    act(() => {
      vi.advanceTimersByTime(7500);
    });

    expect(screen.getByAltText('Fire')).toHaveClass('fire-idle');
    expect(screen.getByAltText('Fire')).not.toHaveClass('fire-boost');
  });
});
