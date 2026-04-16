import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateLatex } from '../../../components/latex/GenerateLatex';

describe('GenerateLatex', () => {
  const mockSongs = [
    {
      id: '1',
      title: 'Test sang',
      melody: 'Test melodi',
      verses: ['Vers 1'],
      chorus: 'Refreng',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('creates a download link and clicks it', () => {
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click');

    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('uses correct filename when not all songs', () => {
    const anchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs, 10);

    expect(anchor.download).toBe('sanger_1.tex');
  });

  it('uses "sanger_alle" when all songs are selected', () => {
    const anchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs, 1);

    expect(anchor.download).toBe('sanger_alle.tex');
  });
});
