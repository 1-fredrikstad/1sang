import { describe, test, expect } from 'vitest';
import { getPlaylistFieldValidation, TEXT_PATTERN } from '@/src/lib/validation/playlistSchema';

describe('getPlaylistFieldValidation', () => {
  test('returns required rule for title', () => {
    const rules = getPlaylistFieldValidation('title');

    expect(rules.required).toBe('Du må skrive inn tittel');
  });

  test('returns min/max length for password', () => {
    const rules = getPlaylistFieldValidation('password');

    expect(rules.minLength?.value).toBe(4);
    expect(rules.maxLength?.value).toBe(20);
  });

  test('always includes pattern rule', () => {
    const rules = getPlaylistFieldValidation('title');

    expect(rules.pattern.value).toBe(TEXT_PATTERN);
  });
});
