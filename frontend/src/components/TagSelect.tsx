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

type TagSelectProps = {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
};

export default function TagSelect({ value, onChange }: TagSelectProps) {
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

  const toggleTag = (tag: Tag) => {
    const isSelected = selectedIds.includes(tag.id);
    const newSelectedIds = isSelected
      ? selectedIds.filter((id) => id !== tag.id)
      : [...selectedIds, tag.id];

    const selectedTags = tags.filter((t) => newSelectedIds.includes(t.id));

    onChange(selectedTags);
  };

  const selectedTagNames = tags
    .filter((tag) => selectedIds.includes(tag.id))
    .map((tag) => tag.name);

  return (
    <div className="mb-5">
      <label className="block mb-2">Tags</label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {selectedTagNames.length > 0 ? selectedTagNames.join(', ') : 'Velg tags'}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tags</DropdownMenuLabel>

            {tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedIds.includes(tag.id)}
                onCheckedChange={() => toggleTag(tag)}
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
