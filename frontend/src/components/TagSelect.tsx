'use client';

import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/lib/db';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tag } from '../lib/db';

export type TagSelectProps = {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  triggerClassName?: string;
};

// Multi-select dropdown for choosing tags
export default function TagSelect({ value, onChange, triggerClassName }: TagSelectProps) {
  // Tags are already synced to Dexie by auto-sync — no API fetch needed
  const tags = useLiveQuery(() => db.tags.toArray(), []) ?? [];

  const selectedIds = useMemo(() => value.map((t) => t.id), [value]);
  const [open, setOpen] = useState(false);

  // Toggle a tag in the selection
  const toggleTag = (tag: Tag) => {
    const isSelected = selectedIds.includes(tag.id);
    const newSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== tag.id)
      : [...selectedIds, tag.id];

    const selectedTags = tags.filter((t) => newSelectedIds.includes(t.id));

    onChange(selectedTags);
  };

  const selectedTagNames = value.map((tag) => tag.name);

  return (
    <div className="mb-5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={triggerClassName ?? 'w-full justify-between'}>
            {selectedTagNames.length > 0 ? selectedTagNames.join(', ') : 'Velg tags'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 text-gray-400 hover:text-black"
          >
            ✕
          </button>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tags</DropdownMenuLabel>

            {tags.map((tag) => {
              const displayName =
                tag.name.charAt(0).toUpperCase() + tag.name.slice(1).toLowerCase();

              return (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {displayName}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
