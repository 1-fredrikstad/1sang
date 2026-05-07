export type Token = { chords?: string[]; word: string };

export function parseChordText(text: string): Token[] {
  const tokens: Token[] = [];
  // Regex splits text into:
  // 1. optional chord blocks like [C][G]
  // 2. the following word or whitespace
  const regex = /((?:\[[^\]]+\])*)([^\[\s]+[\s]?|\s+)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const chordBlock = match[1] || '';

    // Extract individual chords from [C], [G], etc.
    const chords = [...chordBlock.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]).filter(Boolean);

    tokens.push({
      chords: chords.length ? chords : undefined,
      word: match[2],
    });
  }

  return tokens;
}

export function setChordOnToken(text: string, tokenIndex: number, chord?: string) {
  const tokens = parseChordText(text);

  // Guard: ignore invalid index
  if (!tokens[tokenIndex]) return text;

  // If no chord is provided, remove all chords from the token
  if (!chord) {
    tokens[tokenIndex].chords = undefined;
  } else {
    const currentChords = tokens[tokenIndex].chords ?? [];

    // Toggle chord: add if missing, remove if present
    const exists = currentChords.includes(chord);

    tokens[tokenIndex].chords = exists
      ? currentChords.filter((c) => c !== chord)
      : [...currentChords, chord];

    // Normalize empty array to undefined for cleaner output
    if (!tokens[tokenIndex].chords.length) {
      tokens[tokenIndex].chords = undefined;
    }
  }

  // Rebuild text from tokens back into chord markup format
  return tokens.map((t) => `${t.chords?.map((c) => `[${c}]`).join('') ?? ''}${t.word}`).join('');
}
