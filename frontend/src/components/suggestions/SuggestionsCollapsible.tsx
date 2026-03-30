'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { type SongSuggestion } from '@/src/lib/db';

interface SuggestionsCollapsibleProps {
  suggestions: SongSuggestion[];
}

export function SuggestionsCollapsible({ suggestions }: SuggestionsCollapsibleProps) {
  const [open, setOpen] = useState(suggestions.length > 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="group w-full flex items-center justify-between cursor-pointer">
          <span>Inkomne forslag</span>
          <ChevronDownIcon className="h-5 w-5 allow-animation transition-transform duration-500 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden collapsible-content data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="px-0 pb-4 mt-2 pt-1 allow-animation">
          {suggestions.length === 0 ? (
            <div className="opacity-80 overflow-hidden">Ingen ventende forslag</div>
          ) : (
            <ul className="space-y-2 mx-1">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/admin/suggestions/${s.id}`}
                    className="group w-full block py-4 pr-10 pl-4 rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black hover:shadow-sm active:scale-[0.99] allow-animation transition"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
