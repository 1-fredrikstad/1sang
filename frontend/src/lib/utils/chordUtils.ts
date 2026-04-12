export type Token = { chords?: string[]; word: string };

export function parseChordText(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /((?:\[[^\]]+\])*)([^\[\s]+[\s]?|\s+)/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const chordBlock = match[1] || '';
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
  if (!tokens[tokenIndex]) return text;

  if (!chord) {
    tokens[tokenIndex].chords = undefined;
  } else {
    const currentChords = tokens[tokenIndex].chords ?? [];
    const exists = currentChords.includes(chord);
    tokens[tokenIndex].chords = exists
      ? currentChords.filter((c) => c !== chord)
      : [...currentChords, chord];

    if (!tokens[tokenIndex].chords.length) {
      tokens[tokenIndex].chords = undefined;
    }
  }

  return tokens.map((t) => `${t.chords?.map((c) => `[${c}]`).join('') ?? ''}${t.word}`).join('');
}
