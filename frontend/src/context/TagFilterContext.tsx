'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Tag } from '../lib/db';

// Context type definition for tag filtering functionality
type TagFilterContextType = {
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  setSingleTag: (tag: Tag) => void;
  removeTag: (tagId: string) => void;
  clearTags: () => void;
};

const TagFilterContext = createContext<TagFilterContextType | undefined>(undefined);

// Provider that manages global tag filter state across the app
export function TagFilterProvider({ children }: { children: ReactNode }) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const addTag = (tag: Tag) => {
    setSelectedTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev; // prevents duplicates
      return [...prev, tag];
    });
  };

  // Replaces all current tag-filters
  const setSingleTag = (tag: Tag) => {
    setSelectedTags([tag]);
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const clearTags = () => setSelectedTags([]);

  return (
    <TagFilterContext.Provider
      value={{
        selectedTags,
        setSelectedTags,
        addTag,
        setSingleTag,
        removeTag,
        clearTags,
      }}
    >
      {children}
    </TagFilterContext.Provider>
  );
}

// Hook to use context safely
export const useTagFilter = () => {
  const context = useContext(TagFilterContext);
  if (context === undefined) {
    throw new Error('useTagFilter må brukes innenfor TagFilterProvider');
  }
  return context;
};
