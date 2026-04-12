'use client';

import { useEffect, useRef, useState } from 'react';
import { COMMON_CHORDS } from '@/src/lib/constants/chords';
import type { Token } from '@/src/lib/utils/chordUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type ChordPopoverProps = {
  isOpen: boolean;
  token: Token;
  onClose: () => void;
  onChordSelect: (chord?: string) => void;
};

export function ChordPopover({ isOpen, token, onClose, onChordSelect }: ChordPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [customChord, setCustomChord] = useState('');
  const [openAbove, setOpenAbove] = useState(false);
  const [maxHeight, setMaxHeight] = useState<number>(320);

  useEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      if (!popoverRef.current) return;
      const anchorRect = popoverRef.current.parentElement?.getBoundingClientRect();
      if (!anchorRect) return;

      const gap = 8;
      const spaceBelow = window.innerHeight - anchorRect.bottom - gap;
      const spaceAbove = anchorRect.top - gap;

      const shouldOpenAbove = spaceBelow < 260 && spaceAbove > spaceBelow;
      setOpenAbove(shouldOpenAbove);

      const availableSpace = shouldOpenAbove ? spaceAbove : spaceBelow;

      setMaxHeight(Math.max(140, Math.floor(availableSpace)));
    };

    requestAnimationFrame(updatePlacement);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);

    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChordClick = (chord: string) => {
    onChordSelect(chord);
  };

  const handleCustomChord = () => {
    const nextChord = customChord.trim();
    if (!nextChord) return;

    onChordSelect(nextChord);
    setCustomChord('');
  };

  const handleRemoveChord = () => {
    onChordSelect(undefined);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border bg-background p-2.5 shadow-lg"
      style={{
        position: 'absolute',
        top: openAbove ? 'auto' : '100%',
        bottom: openAbove ? '100%' : 'auto',
        left: 0,
        zIndex: 50,
        marginTop: openAbove ? 0 : '4px',
        marginBottom: openAbove ? '4px' : 0,
        minWidth: '220px',
        maxHeight: `${maxHeight}px`,
        overflowY: 'auto',
      }}
    >
      <div className="mb-2 grid grid-cols-4 gap-1">
        {COMMON_CHORDS.map((chord) => {
          const active = token.chords?.includes(chord);

          return (
            <Button
              key={chord}
              type="button"
              onClick={() => handleChordClick(chord)}
              variant={active ? 'default' : 'outline'}
              size="xs"
              className={cn(
                'w-full text-[11px] cursor-pointer',
                active && 'ring-1 ring-primary/50'
              )}
            >
              {chord}
            </Button>
          );
        })}
      </div>

      <div className="mb-2 flex gap-1.5">
        <Input
          type="text"
          value={customChord}
          placeholder="Egen akkord"
          onChange={(e) => setCustomChord(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCustomChord();
            }
          }}
          className="h-7 text-xs"
        />
        <Button
          type="button"
          onClick={handleCustomChord}
          variant="outline"
          size="xs"
          className="cursor-pointer"
        >
          Legg til
        </Button>
      </div>

      {token.chords?.length && (
        <Button
          type="button"
          onClick={handleRemoveChord}
          variant="outline"
          size="xs"
          className="cursor-pointer"
        >
          Fjern akkord
        </Button>
      )}
    </div>
  );
}
