'use client';

import { useRef } from 'react';
import { CircleXIcon, LoaderCircleIcon, SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
};

export function SearchField({ value, onChange, isLoading = false }: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Clears search input and restores focus
  const clearInput = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="mb-6">
      <div className="relative">
        {/* Left search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          <SearchIcon className="h-4 w-4" />
        </div>

        {/* Main search input */}
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Søk etter sanger..."
          className="h-11 pl-9 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
        />

        {/* Right side */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {/* Show spinner when loading */}
          {isLoading ? (
            <LoaderCircleIcon className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : value ? (
            // Show clear button only when there is input
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearInput}
              className="text-muted-foreground focus-visible:ring-ring/50 inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            >
              <CircleXIcon className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
