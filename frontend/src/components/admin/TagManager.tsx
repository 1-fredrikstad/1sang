'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { TagListItem } from './TagListItem';
import { useTags } from '@/src/hooks/useTags';

// component for managing tags in the admin dashboard
export default function TagManager() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { tags, isLoading, isPending, createTag, updateTag, deleteTag } = useTags();

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    const success = await createTag(newTagName);
    if (success) {
      setNewTagName('');
      setIsAdding(false);
    }
  };

  const handleUpdate = async () => {
    if (!editValue.trim() || !editingId) return;
    const success = await updateTag(editingId, editValue);
    if (success) setEditingId(null);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <div className="group w-full flex items-center justify-between cursor-pointer">
          <span>Administrer tags</span>
          <ChevronDownIcon className="h-5 w-5 allow-animation transition-transform duration-500 group-data-[state=open]:rotate-180" />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-0 pb-4 mt-2 pt-1 allow-animation">
          <div className="flex justify-end mb-3">
            {!isAdding && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
                onClick={() => setIsAdding(true)}
              >
                <Plus size={14} className="mr-1" />
                Ny tag
              </Button>
            )}
          </div>

          {isAdding && (
            <div className="flex items-center gap-2 mb-3 p-2 border rounded-md bg-muted/30">
              <Input
                autoFocus
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewTagName('');
                  }
                }}
                placeholder="Skriv inn navnet på den nye taggen"
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCreate}
                disabled={!newTagName.trim() || isPending}
                className="cursor-pointer px-2"
              >
                <Check size={15} className="text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewTagName('');
                }}
                className="cursor-pointer px-2"
              >
                <X size={15} className="text-muted-foreground" />
              </Button>
            </div>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground opacity-80">Laster inn tags...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm opacity-80">Ingen tags funnet.</p>
          ) : (
            <ul className="space-y-2 mx-1">
              {tags.map((tag) => (
                <TagListItem
                  key={tag.id}
                  tag={tag}
                  isEditing={editingId === tag.id}
                  editValue={editValue}
                  isPending={isPending}
                  onEditChange={setEditValue}
                  onEditConfirm={handleUpdate}
                  onEditCancel={() => {
                    setEditingId(null);
                    setEditValue('');
                  }}
                  onEditStart={() => {
                    setEditingId(tag.id);
                    setEditValue(tag.name);
                  }}
                  onDelete={() => deleteTag(tag)}
                />
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
