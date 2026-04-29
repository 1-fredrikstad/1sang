'use client';

import { Song } from '../../lib/db';

// Songs that should end with a verse instead of repeating final chorus
// (special-case behavior based on historical formatting rules)
const SPECIAL_LAST_VERSE_SONGS = new Set([
  'Nelaug, 1990',
  'Helt vilt, 2017 landsleir Bodø',
  'Dotømmervise',
  'Adieu',
  'Country Roads',
]);

// Matches chord blocks like [C], [G7], etc.
const CHORD_REGEX = /\[([^\]]+)\]/g;

// Separator used when stacking multiple chords on same position
const STACKED_CHORD_SEPARATOR = '/_';

// Escapes LaTeX special characters in normal lyrics text
function escapeLatexText(text: string): string {
  if (!text) return '';

  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

// Escapes LaTeX special characters inside chord labels
function escapeLatexChord(chord: string): string {
  if (!chord) return '';

  return chord
    .trim()
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}');
}

// Formats one or more chords into LaTeX superscript format
// Single chord: ^{C}
// Multiple chords: ^{C/_G/_Am}
function formatChordGroup(chords: string[]): string {
  const cleaned = chords.map(escapeLatexChord).filter(Boolean);

  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return `^{${cleaned[0]}}`;

  return `^{${cleaned.join(STACKED_CHORD_SEPARATOR)}}`;
}

// Converts a single line of text with embedded [chords] into LaTeX
function convertChordLine(line: string): string {
  if (!line) return '';

  let result = '';
  let pendingChords: string[] = [];
  let lastIndex = 0;

  // Iterate through all chord markers in the line
  for (const match of line.matchAll(CHORD_REGEX)) {
    const matchIndex = match.index!;
    const textBetween = line.slice(lastIndex, matchIndex);

    // If we hit real text, flush pending chords before it
    if (textBetween && textBetween.trim() !== '') {
      result += `${formatChordGroup(pendingChords)}${escapeLatexText(textBetween)}`;
      pendingChords = [];
    } else if (textBetween) {
      result += escapeLatexText(textBetween);
    }

    // Collect chord(s) for next text segment
    pendingChords.push(match[1]);
    lastIndex = matchIndex + match[0].length;
  }

  // Handle remaining tail after last chord
  const tail = line.slice(lastIndex);
  result += `${formatChordGroup(pendingChords)}${escapeLatexText(tail)}`;

  return result;
}

// Formats a full section (verse or chorus) into LaTeX blocks
function formatSection(section: string | null | undefined): string {
  if (!section) return '';

  const normalized = section.replace(/\r\n/g, '\n').trimEnd();
  const blocks = normalized.split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split('\n');
      return lines.map((line) => convertChordLine(line.trimEnd())).join('\\\\\n');
    })
    .join('\\\\[0.7em]\n');
}

// Converts a single song into LaTeX format
function songToLatex(song: Song): string {
  const verses = song.verses ?? [];

  // Some songs should not repeat final chorus
  const isSpecialSong = SPECIAL_LAST_VERSE_SONGS.has(song.title || '');

  const title = escapeLatexText((song.title || '').toLocaleUpperCase('nb-NO'));
  const melody = song.melody ? escapeLatexText(song.melody) : '';
  const chorus = formatSection(song.chorus);
  const credit = song.author || '';

  const parts: string[] = [];

  parts.push(`\\begin{song}{title={${title}}}`);
  parts.push('');

  // Optional melody line
  if (melody) {
    parts.push(`{\\itshape Mel: ${melody}}`);
    parts.push('\\vspace{0.5em}');
    parts.push('');
  }

  // Render verses and optional intermediate choruses
  verses.forEach((verse, index) => {
    parts.push('\\begin{verse}');
    parts.push(formatSection(verse));
    parts.push('\\end{verse}');
    parts.push('');

    // Insert chorus between verses (except last verse)
    if (chorus && index < verses.length - 1) {
      parts.push('\\begin{chorus}');
      parts.push(chorus);
      parts.push('\\end{chorus}');
      parts.push('');
    }
  });

  // Final chorus (unless song is marked special-case)
  if (!isSpecialSong && chorus) {
    parts.push('\\begin{chorus}');
    parts.push(chorus);
    parts.push('\\end{chorus}');
    parts.push('');
  }

  // Credit or spacing fallback
  if (credit) {
    parts.push(`\\songcredit{${escapeLatexText(credit)}}`);
  } else {
    parts.push('\\vspace{2.3em}');
  }

  parts.push('');
  parts.push('\\end{song}');

  return parts.join('\n');
}

// Generates full LaTeX document and triggers download
export function generateLatex(songs: Song[], totalAvailableSongs?: number) {
  const latex = [
    '\\documentclass{article}',
    '\\usepackage{leadsheets}',
    '\\usepackage{fontspec}',
    '',
    '\\setmainfont{Times New Roman}',
    '',
    '% --- leadsheets config ---',
    '\\setleadsheets{',
    '  chords/format = \\bfseries\\fontsize{12}{12}\\selectfont,',
    '  align-chords = c,',
    '  smash-chords = true,',
    '  smash-next-chord = true,',
    '  text-format = {\\fontsize{14}{18}\\selectfont},',
    '  bar-shortcuts = false,',
    '  chorus/name = \\bfseries{Ref:},',
    '  verse/after-label = {},',
    '  chorus/after-label = {},',
    '}',
    '',
    '% --- layout tweaks ---',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\leftmargini}{0.4em}',
    '\\setlength{\\leftmarginii}{0.4em}',
    '',
    '% --- song credit command ---',
    '\\newcommand{\\songcredit}[1]{%',
    '  \\vspace{1.8em}%',
    '  {\\raggedleft \\itshape #1 \\par}%',
    '  \\vspace{0.5em}%',
    '}',
    '',
    '\\begin{document}',
    '',
    songs.map(songToLatex).join('\n\n'),
    '',
    '\\end{document}',
  ].join('\n');

  // Dynamic filename based on selection size
  let filename = 'sanger';
  if (totalAvailableSongs && songs.length === totalAvailableSongs) {
    filename = 'sanger_alle';
  } else {
    filename = `sanger_${songs.length}`;
  }

  // Create downloadable .tex file
  const blob = new Blob([latex], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.tex`;
  a.click();

  URL.revokeObjectURL(url);
}
