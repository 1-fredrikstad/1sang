import { describe, expect, test } from 'vitest';
import {
  getFieldValidation,
  normalizeSongInput,
  validateSongInput,
  songSuggestionSchema,
} from '../../../lib/validation/songSuggestionSchema';

describe('getFieldValidation', () => {
  test('returns correct validation config for title', () => {
    const result = getFieldValidation('title');

    expect(result.required).toBe(songSuggestionSchema.title.messages.required);
    expect(result.maxLength).toEqual({
      value: 40,
      message: songSuggestionSchema.title.messages.maxLength,
    });
    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.title.messages.pattern,
    });
  });

  test('returns correct validation config for melody', () => {
    const result = getFieldValidation('melody');

    expect(result.required).toBeUndefined();

    expect(result.maxLength).toEqual({
      value: 40,
      message: songSuggestionSchema.melody.messages.maxLength,
    });
    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.melody.messages.pattern,
    });
  });

  test('returns correct validation config for author', () => {
    const result = getFieldValidation('author');

    expect(result.required).toBeUndefined();

    expect(result.maxLength).toEqual({
      value: 40,
      message: songSuggestionSchema.author.messages.maxLength,
    });
    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.author.messages.pattern,
    });
  });

  test('returns correct validation config for lyrics', () => {
    const result = getFieldValidation('lyrics');

    expect(result.required).toBe(songSuggestionSchema.lyrics.messages.required);

    expect(result.maxLength).toEqual({
      value: 3000,
      message: songSuggestionSchema.lyrics.messages.maxLength,
    });

    expect(result.minLength).toEqual({
      value: 20,
      message: songSuggestionSchema.lyrics.messages.minLength,
    });

    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.lyrics.messages.pattern,
    });
  });
});

describe('normalizeSongInput', () => {
  test('trims whitespace from fields', () => {
    const input = {
      title: ' My Song  ',
      melody: ' Traditional   ',
      author: '   Justin Bieber',
      lyrics: '  Dette er en gyldig sangtekst med mer enn tjue tegn.   ',
    };
    const result = normalizeSongInput(input);

    expect(result).toEqual({
      title: 'My Song',
      melody: 'Traditional',
      author: 'Justin Bieber',
      lyrics: 'Dette er en gyldig sangtekst med mer enn tjue tegn.',
    });
  });

  test('returns empty strings for missing fields', () => {
    const result = normalizeSongInput({});

    expect(result).toEqual({
      title: '',
      melody: '',
      author: '',
      lyrics: '',
    });
  });
});

describe('validateSongInput', () => {
  const validInput = {
    title: 'En sang',
    melody: '',
    author: '',
    lyrics: 'Dette er en gyldig sangtekst med mer enn tjue tegn.',
  };

  test('returns error message when title is emty', () => {
    const result = validateSongInput({
      ...validInput,
      title: '',
    });
    expect(result.title).toBe(songSuggestionSchema.title.messages.required);
  });

  test('returns error message when lyrics is empty', () => {
    const result = validateSongInput({
      ...validInput,
      lyrics: '',
    });

    expect(result.lyrics).toBe(songSuggestionSchema.lyrics.messages.required);
  });

  test('returns error message when lyrics is too short', () => {
    const result = validateSongInput({
      ...validInput,
      lyrics: 'For kort tekst',
    });

    expect(result.lyrics).toBe(songSuggestionSchema.lyrics.messages.minLength);
  });

  test('returns error message when title is too long', () => {
    const result = validateSongInput({
      ...validInput,
      title: 'a'.repeat(41),
    });

    expect(result.title).toBe(songSuggestionSchema.title.messages.maxLength);
  });

  test('allows empty optional fields', () => {
    const result = validateSongInput(validInput);

    expect(result.author).toBeUndefined();
    expect(result.melody).toBeUndefined();
  });

  test('returns no errors for valid input', () => {
    const result = validateSongInput(validInput);

    expect(result).toEqual({});
  });

  test('trims input before validating', () => {
    const result = validateSongInput({
      ...validInput,
      title: '   ',
    });

    expect(result.title).toBe(songSuggestionSchema.title.messages.required);
  });
});
