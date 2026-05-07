import { describe, test, expect, vi, beforeEach } from 'vitest';
import { generateLatex } from '../../../components/latex/GenerateLatex';

describe('GenerateLatex', () => {
  const mockSongs = [
    {
      id: '1',
      title: 'Test sang',
      melody: 'Test melodi',
      verses: ['Vers 1'],
      chorus: 'Refreng',
      has_chords: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  test('creates a download link and clicks it', () => {
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click');

    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs);

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  test('uses correct filename when not all songs', () => {
    const anchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs, 10);

    expect(anchor.download).toBe('sanger_1.tex');
  });

  test('uses "sanger_alle" when all songs are selected', () => {
    const anchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);

    generateLatex(mockSongs, 1);

    expect(anchor.download).toBe('sanger_alle.tex');
  });
});
