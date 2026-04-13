import { parseChordText } from '@/src/lib/utils/chordUtils';

type LyricsProps = {
  chorus?: string;
  verses: string[];
  showChords?: boolean;
};

export default function Lyrics({ chorus, verses, showChords = false }: LyricsProps) {
  const renderSection = (text: string) => {
    const lines = text.replace(/\\n/g, '\n').split('\n');

    return lines.map((line, i) => {
      if (!showChords) {
        return <div key={i}>{line.replace(/\[[^\]]+\]/g, '')}</div>;
      }

      const tokens = parseChordText(line);

      return (
        <div key={i}>
          <span className="inline-flex flex-wrap leading-[1.2]">
            {tokens.map((token, j) => (
              <span key={j} className="mr-1 inline-flex flex-col">
                <span className="min-h-[1.1em] text-[0.7em] font-medium leading-none">
                  {token.chords?.join('/') || '\u00A0'}
                </span>
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
      {verses.map((verse, i) => (
        <div key={i}>
          {renderSection(verse)}
          {'\n\n'}
          {chorus && i < verses.length - 1 && (
            <>
              <strong>Ref: </strong>
              {renderSection(chorus)}
              {'\n\n'}
            </>
          )}
        </div>
      ))}
    </section>
  );
}
