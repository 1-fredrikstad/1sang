'use client';

import { Song } from '../../lib/db';

// Songs that should end with a verse instead of a final chorus
// (based on customers earlier songs)
const SPECIAL_LAST_VERSE_SONGS = new Set([
  'Nelaug, 1990',
  'Helt vilt, 2017 landsleir Bodø',
  'Dotømmervise',
  'Adieu',
  'Country Roads',
]);

const CHORD_REGEX = /\[([^\]]+)\]/g;
const STACKED_CHORD_SEPARATOR = '/_';

// Escapes special LaTeX characters in regular song text
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

// Escapes special LaTeX characters inside chords
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

// Formats chords. If multiple: ^{Bm/_D/_G7}
function formatChordGroup(chords: string[]): string {
  const cleaned = chords.map(escapeLatexChord).filter(Boolean);
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return `^{${cleaned[0]}}`;
  return `^{${cleaned.join(STACKED_CHORD_SEPARATOR)}}`;
}

// Converts line to chord latex
function convertChordLine(line: string): string {
  if (!line) return '';

  let result = '';
  let pendingChords: string[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(CHORD_REGEX)) {
    const matchIndex = match.index!;
    const textBetween = line.slice(lastIndex, matchIndex);

    if (textBetween && textBetween.trim() !== '') {
      result += `${formatChordGroup(pendingChords)}${escapeLatexText(textBetween)}`;
      pendingChords = [];
    } else if (textBetween) {
      result += escapeLatexText(textBetween);
    }

    pendingChords.push(match[1]);
    lastIndex = matchIndex + match[0].length;
  }

  const tail = line.slice(lastIndex);
  result += `${formatChordGroup(pendingChords)}${escapeLatexText(tail)}`;

  return result;
}

// Formats a verse or chorus to latex
function formatSection(section: string | null | undefined): string {
  if (!section) return '';

  const normalized = section.replace(/\r\n/g, '\n').trimEnd();
  const blocks = normalized.split(/\n\s*\n/);

  return blocks
    .map((block) => {
      const lines = block.split('\n');
      return lines.map((line) => convertChordLine(line.trimEnd())).join('\\\\\n');
    })
    .join('\\\\[0.7em]\n'); // fast ekstra spacing mellom avsnitt
}

// Convers a song to a latex song
function songToLatex(song: Song): string {
  const verses = song.verses ?? [];
  const isSpecialSong = SPECIAL_LAST_VERSE_SONGS.has(song.title || '');
  const title = escapeLatexText((song.title || '').toLocaleUpperCase('nb-NO'));
  const melody = song.melody ? escapeLatexText(song.melody) : '';
  const chorus = formatSection(song.chorus);
  const credit = song.author || ''; // behold din endring

  const parts: string[] = [];

  parts.push(`\\begin{song}{title={${title}}}`);
  parts.push('');

  if (melody) {
    parts.push(`{\\itshape Mel: ${melody}}`);
    parts.push('\\vspace{0.5em}');
    parts.push('');
  }

  verses.forEach((verse, index) => {
    parts.push('\\begin{verse}');
    parts.push(formatSection(verse));
    parts.push('\\end{verse}');
    parts.push('');

    if (chorus && index < verses.length - 1) {
      parts.push('\\begin{chorus}');
      parts.push(chorus);
      parts.push('\\end{chorus}');
      parts.push('');
    }
  });

  if (!isSpecialSong && chorus) {
    parts.push('\\begin{chorus}');
    parts.push(chorus);
    parts.push('\\end{chorus}');
    parts.push('');
  }

  if (credit) {
    parts.push(`\\songcredit{${escapeLatexText(credit)}}`);
    parts.push('');
  }

  parts.push('\\end{song}');

  return parts.join('\n');
}

// Main export function: generate a full latex document and triggers download
export function generateLatex(songs: Song[], totalAvailableSongs?: number) {
  const latex = [
    '\\documentclass{article}',
    '\\usepackage{leadsheets}',
    '\\usepackage{fontspec}',
    '',
    '\\setmainfont{Times New Roman}',
    '',
    '% --- Innstillinger for leadsheets ---',
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
    '% --- Layout ---',
    '\\setlength{\\parindent}{0pt}',
    '\\setlength{\\leftmargini}{0.4em}',
    '\\setlength{\\leftmarginii}{0.4em}',
    '',
    '% --- Kommando for låtskriver ---',
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

  let filename = 'sanger';
  if (totalAvailableSongs && songs.length === totalAvailableSongs) {
    filename = 'sanger_alle';
  } else {
    filename = `sanger_${songs.length}`;
  }

  const blob = new Blob([latex], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.tex`;
  a.click();
  URL.revokeObjectURL(url);
}
