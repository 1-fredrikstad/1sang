import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  it('plays sound and adds boost class on click', async () => {
    render(<Campfire message="" />);

    const fireImage = screen.getByAltText('Fire');
    const container = fireImage.closest('section') as HTMLElement;

    await container.click();

    expect(playMock).toHaveBeenCalled();
    expect(fireImage.className).toContain('fire-boost');
  });

  it('resets after 7.5 seconds', async () => {
    render(<Campfire message="" />);

    const fireImage = screen.getByAltText('Fire');
    const container = fireImage.closest('section') as HTMLElement;

    await container.click();

    vi.advanceTimersByTime(7500);

    expect(fireImage.className).not.toContain('fire-idle');
  });
});
