import React from 'react';

type LyricsProps = {
  chorus?: string;
  verses: string[];
};

export default function Lyrics({ chorus, verses }: LyricsProps) {
  const formatLineBreaks = (text: string) => text.replace(/\\n/g, '\n');

  return (
    <>
      <section>
        {verses.map((verse, i) => (
          <React.Fragment key={i}>
            {formatLineBreaks(verse)}
            {'\n\n'}
            {chorus && i < verses.length - 1 && (
              <>
                <strong>Ref: </strong>
                {formatLineBreaks(chorus)}
                {'\n\n'}
              </>
            )}
          </React.Fragment>
        ))}
      </section>
    </>
  );
}
