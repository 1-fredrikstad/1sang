'use client';

import { ChordPopover } from './ChordPopover';
import type { Token } from '@/src/lib/utils/chordUtils';
import { cn } from '@/lib/utils';

type TokenButtonProps = {
  token: Token;
  isOpen: boolean;
  onToggle: () => void;
  onChordSelect: (chord?: string) => void;
};

export function TokenButton({ token, isOpen, onToggle, onChordSelect }: TokenButtonProps) {
  return (
    <span
      onClick={onToggle}
      className="relative mr-1 inline-flex cursor-pointer flex-col items-center"
    >
      <span className="min-h-3.5 text-[11px] font-medium">{token.chords?.join('/') || '-'}</span>

      <span
        className={cn('rounded px-0.5', token.chords?.length && 'bg-(--color-background-info)')}
      >
        {token.word}
      </span>

      {isOpen && (
        <ChordPopover
          isOpen={isOpen}
          token={token}
          onClose={onToggle}
          onChordSelect={onChordSelect}
        />
      )}
    </span>
  );
}
