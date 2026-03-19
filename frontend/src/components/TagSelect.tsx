'use client';

import { useEffect, useMemo, useState } from 'react';

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

  return (
    <div className="mb-5">
      <label>Tags</label>

      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-2 py-1 rounded border ${
              selectedIds.includes(tag.id) ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
