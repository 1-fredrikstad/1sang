export const DEFAULT_HJEMMELAGET_TAG_ID = 'b793d17c-9d72-402f-8211-bd3f1fbc32f9';

export function withDefaultSongTags(tagIds: string[] = []) {
  return Array.from(new Set([...tagIds, DEFAULT_HJEMMELAGET_TAG_ID]));
}
