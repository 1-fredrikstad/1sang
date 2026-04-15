'use client';

import { Button } from '@/components/ui/button';
import { Song } from '../lib/db';
import { toast } from 'sonner';

// AI has helped me write escapeLatex and formatLine as I was unsure about regex

export default function MakeIntoLatex() {
  // List of songs that should have last verse and not last chorus (based on the json-file sent by the customer)
  const specialLastVerseSongs = [
    'Nelaug, 1990',
    'Helt vilt, 2017 landsleir Bodø',
    'Dotømmervise',
    'Adieu',
    'Country Roads',
  ];

  // Replace latex's special chars found in data
  function escapeLatex(text: string): string {
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

  // Escape all special chars and convert chords from [Am] to /[Am]
  function formatLine(line: string | null): string {
    if (!line) return '';

    let processed = escapeLatex(line);
    processed = processed.replace(/\[([^\]]+)\]/g, '^{$1}');
    processed = processed.replace(/\n/g, '\\\\');

    return processed;
  }

  function songToLatex(song: Song): string {
    const isSpecialSong = specialLastVerseSongs.includes(song.title || '');
    const hasMultipleVerses = song.verses.length > 1;

    const title = escapeLatex((song.title || '').toLocaleUpperCase());

    let latex = `
      \\begin{song}{title={${title}}}
      `;

    if (song.melody) {
      latex += `
      \\vspace{-0.6em}
      {\\itshape Melodi: ${escapeLatex(song.melody)}}\\\\[-0.4em]
      `;
    }

    song.verses.forEach((verse, index) => {
      latex += `
        \\begin{verse}
        \\verseline{${hasMultipleVerses ? `${index + 1}. ` : ''}}{${formatLine(verse)}}
        \\end{verse}
        `;

      // Chorus between verses
      if (song.chorus && index < song.verses.length - 1) {
        latex += `
        \\begin{chorus}
        ${formatLine(song.chorus)}
        \\end{chorus}
        `;
      }
    });

    // Chorus at the end
    if (!isSpecialSong && song.chorus) {
      latex += `
      \\begin{chorus}
      ${formatLine(song.chorus)}
      \\end{chorus}
      `;
    }

    latex += `
      \\end{song}
      `;

    return latex;
  }

  async function generateLatex() {
    try {
      const res = await fetch('/api/songs');

      if (!res.ok) {
        throw new Error('Kunne ikke hente sanger');
      }

      const json = await res.json();
      const songs: Song[] = json.data;

      const latex = `\\documentclass{article}
        \\usepackage[utf8]{inputenc}
        \\usepackage[T1]{fontenc}
        \\usepackage{leadsheets}

        \\newlength{\\versenumberwidth}
        \\setlength{\\versenumberwidth}{2em}

        \\newcommand{\\verseline}[2]{%
          \\noindent
          \\makebox[0.7em][1]{#1}%
          \\hspace{0.4em}%
          \\parbox[t]{\\dimexpr\\linewidth-1.5em}{#2}%
        }

        % --- Innstillinger for leadsheets ---
        \\setleadsheets{
          chords/format = \\bfseries,
          align-chords = l,
          bar-shortcuts = false,
          chorus/name = \\bfseries{Ref:},
          verse/after-label = {},
          chorus/after-label = {},
        }

        % --- Layout og innrykk ---
        \\setlength{\\parindent}{0pt}
        \\setlength{\\leftmargini}{0.4em}
        \\setlength{\\leftmarginii}{0.4em}

        \\begin{document}

        ${songs.map((s) => songToLatex(s)).join('\n\n')}

        \\end{document}
        `;

      const blob = new Blob([latex], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'sanger.tex';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Feil ved generering av LaTex:', error);
      toast.error('Kunne ikke laste ned LaTex');
    }
  }

  return <Button onClick={generateLatex}>Last ned LaTeX</Button>;
}
