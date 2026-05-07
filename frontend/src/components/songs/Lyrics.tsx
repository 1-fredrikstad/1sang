import { Song } from '@/src/lib/db';
import { parseChordText } from '@/src/lib/utils/chordUtils';

type LyricsProps = {
  song: Song;
  showChords?: boolean;
};

// Songs that should end with a verse instead of a final chorus
// (based on customers earlier songs)
const SPECIAL_LAST_VERSE_SONGS = new Set([
  'Nelaug, 1990',
  'Helt vilt, 2017 landsleir Bodø',
  'Dotømmervise',
  'Adieu',
  'Country Roads',
]);

export default function Lyrics({ song, showChords = false }: LyricsProps) {
  // Check if if song should skip chorus after final verse (lastVerse)
  const isSpecialSong = SPECIAL_LAST_VERSE_SONGS.has(song.title || '');

  // Renders a verse or chorus block line by line
  const renderSection = (text: string) => {
    // Convert escaped "\n" into real line breaks, then split into lines
    const lines = text.replace(/\\n/g, '\n').split('\n');

    return lines.map((line, i) => {
      // If chords are hidden, remove markers like [G], [Am], ...
      if (!showChords) {
        return <div key={i}>{line.replace(/\[[^\]]+\]/g, '')}</div>;
      }

      // Parse line into tokens containing words + optional chords
      const tokens = parseChordText(line);

      return (
        <div key={i}>
          {/* Inline chord/word layout */}
          <span className="inline-flex flex-wrap leading-[1.2]">
            {tokens.map((token, j) => (
              <span key={j} className="mr-1 inline-flex flex-col">
                {/* Chord shown above word */}
                <span className="min-h-[1.1em] text-[0.7em] font-medium leading-none">
                  {token.chords?.join('/') || '\u00A0'}
                </span>
                {/* Lyric word */}
                <span className="leading-[1.8]">{token.word}</span>
              </span>
            ))}
          </span>
        </div>
      );
    });
  };

  return (
    <section>
      {isSpecialSong
        ? song.verses.map((verse, i) => (
            <div key={i} className="mb-5">
              {/* Render verse */}
              {renderSection(verse)}

              {/* For special songs:
                  show chorus after every verse EXCEPT the final verse */}
              {song.chorus && i !== song.verses.length - 1 && (
                <span className="block my-7">
                  <strong>Ref: </strong>
                  {renderSection(song.chorus)}
                </span>
              )}
            </div>
          ))
        : song.verses.map((verse, i) => (
            <div key={i} className="mb-5">
              {/* Render verse */}
              {renderSection(verse)}

              {/* Standard songs:
                  show chorus after every verse */}
              {song.chorus && (
                <span className="block my-7">
                  <strong>Ref: </strong>
                  {renderSection(song.chorus)}
                </span>
              )}
            </div>
          ))}
    </section>
  );
}
