'use client';

import { useEffect, useState } from 'react';
import { TokenButton } from './TokenButton';
import { parseChordText, setChordOnToken } from '@/src/lib/utils/chordUtils';

type Section = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type ChordPreviewProps = {
  sections: Section[];
};

export default function ChordPreview({ sections }: ChordPreviewProps) {
  // Tracks which token currently has an open chord popover
  const [openKey, setOpenKey] = useState<string | null>(null);

  // Close any open popover when clicking outside of a token area
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Only keep popover open if click is inside a chord token container
      if (!target.closest('[data-chord-popover]')) {
        setOpenKey(null);
      }
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div className="mt-4 rounded-lg border-[0.5px] border-(--color-border-tertiary) bg-(--color-background-secondary) p-3 text-sm">
      <span className="w-full text-xs text-gray-400 mb-2 block">
        Klikk på et ord for å sette akkord:
      </span>

      {sections.map((section, si) => {
        // Split raw text into tokens (words + metadata like chords)
        const tokens = parseChordText(section.value);

        return (
          <div key={si} className="mb-4">
            <span className="text-xs text-gray-400 block mb-1">{section.label}</span>

            <div className="flex flex-wrap gap-0.5 leading-[2.4]">
              {tokens.map((token, ti) => {
                const key = `${si}-${ti}`;

                // Controls whether this specific token's popover is open
                const isOpen = openKey === key;

                return (
                  <div key={ti} data-chord-popover>
                    <TokenButton
                      token={token}
                      isOpen={isOpen}
                      onToggle={() => setOpenKey(isOpen ? null : key)}
                      onChordSelect={(chord) => {
                        // Updates only the affected token inside the section text
                        section.onChange(setChordOnToken(section.value, ti, chord));
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
