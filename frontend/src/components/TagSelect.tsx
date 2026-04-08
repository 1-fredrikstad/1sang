'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Tag = {
  id: string;
  name: string;
};

export type TagSelectProps = {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  triggerClassName?: string;
};

export default function TagSelect({ value, onChange, triggerClassName }: TagSelectProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch('/api/tags');
      const body = await res.json();

      if (body.ok) {
        setTags(body.data);
      }
    };

    fetchTags();
  }, []);

  const selectedIds = useMemo(() => value.map((t) => t.id), [value]);
  const [open, setOpen] = useState(false);

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

            {tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedIds.includes(tag.id)}
                onCheckedChange={() => toggleTag(tag)}
                onSelect={(e) => e.preventDefault()}
              >
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
