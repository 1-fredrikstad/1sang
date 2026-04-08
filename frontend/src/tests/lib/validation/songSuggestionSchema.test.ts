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

  test('returns correct validation for chorus', () => {
    const result = getFieldValidation('chorus');

    expect(result.required).toBeUndefined();

    expect(result.maxLength).toEqual({
      value: 500,
      message: songSuggestionSchema.chorus.messages.maxLength,
    });
    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.chorus.messages.pattern,
    });
  });

  test('returns correct validation config for verses', () => {
    const result = getFieldValidation('verses');

    expect(result.required).toBe(songSuggestionSchema.verses.messages.required);

    expect(result.maxLength).toEqual({
      value: 1000,
      message: songSuggestionSchema.verses.messages.maxLength,
    });

    expect(result.minLength).toEqual({
      value: 20,
      message: songSuggestionSchema.verses.messages.minLength,
    });

    expect(result.pattern).toEqual({
      value: expect.any(RegExp),
      message: songSuggestionSchema.verses.messages.pattern,
    });
  });
});

describe('normalizeSongInput', () => {
  test('trims whitespace from fields', () => {
    const input = {
      title: ' My Song  ',
      melody: ' Traditional   ',
      author: '   Justin Bieber',
      verses: ['  Dette er en gyldig sangtekst med mer enn tjue tegn.   '],
    };
    const result = normalizeSongInput(input);

    expect(result).toEqual({
      title: 'My Song',
      melody: 'Traditional',
      author: 'Justin Bieber',
      chorus: '',
      verses: ['Dette er en gyldig sangtekst med mer enn tjue tegn.'],
    });
  });

  test('returns empty strings for missing fields', () => {
    const result = normalizeSongInput({});

    expect(result).toEqual({
      title: '',
      melody: '',
      author: '',
      chorus: '',
      verses: [''],
    });
  });
});

describe('validateSongInput', () => {
  const validInput = {
    title: 'En sang',
    melody: '',
    author: '',
    verses: ['Dette er et gyldig vers med mer enn tjue tegn.'],
  };

  test('returns error message when title is emty', () => {
    const result = validateSongInput({
      ...validInput,
      title: '',
    });
    expect(result.title).toBe(songSuggestionSchema.title.messages.required);
  });

  test('returns error message when verses are empty', () => {
    const result = validateSongInput({
      ...validInput,
      verses: [''],
    });

    expect(result.verses).toBe(songSuggestionSchema.verses.messages.required);
  });

  test('returns error message when verse is too short', () => {
    const result = validateSongInput({
      ...validInput,
      verses: ['For kort tekst'],
    });

    expect(result['verses.0']).toBe(songSuggestionSchema.verses.messages.minLength);
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
