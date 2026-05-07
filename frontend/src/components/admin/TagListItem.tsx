import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Check, X } from 'lucide-react';

type Tag = {
  id: string;
  name: string;
};

interface TagListItemProps {
  tag: Tag;
  isEditing: boolean;
  editValue: string;
  isPending: boolean;
  onEditChange: (value: string) => void;
  onEditConfirm: () => void;
  onEditCancel: () => void;
  onEditStart: () => void;
  onDelete: () => void;
}

// Single tag row component with inline edit + delete support
export function TagListItem({
  tag,
  isEditing,
  editValue,
  isPending,
  onEditChange,
  onEditConfirm,
  onEditCancel,
  onEditStart,
  onDelete,
}: TagListItemProps) {
  return (
    <li className="flex items-center justify-between gap-2 py-3 pr-3 pl-4 rounded-sm outline-1 dark:bg-list-bg outline-[#0000001a] dark:shadow-xs dark:shadow-black allow-animation transition">
      {/* EDIT MODE */}
      {isEditing ? (
        <>
          <Input
            autoFocus
            maxLength={20}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onEditConfirm();
              if (e.key === 'Escape') onEditCancel();
            }}
            className="h-7 text-sm"
          />

          <div className="flex gap-1 shrink-0">
            {/* Confirm edit */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onEditConfirm}
              disabled={!editValue.trim() || isPending}
              className="cursor-pointer px-2 h-7"
            >
              <Check size={14} className="text-green-600" />
            </Button>

            {/* Cancel edit */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onEditCancel}
              className="cursor-pointer px-2 h-7"
            >
              <X size={14} className="text-muted-foreground" />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* DISPLAY MODE */}
          <span className="text-sm truncate capitalize-first">{tag.name}</span>

          <div className="flex gap-1 shrink-0">
            {/* Start editing */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onEditStart}
              className="cursor-pointer px-2 h-7"
              aria-label={`Rediger ${tag.name}`}
            >
              <Pencil size={13} className="text-muted-foreground" />
            </Button>

            {/* Delete tag */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={isPending}
              className="cursor-pointer px-2 h-7"
              aria-label={`Slett ${tag.name}`}
            >
              <Trash2 size={13} className="text-destructive" />
            </Button>
          </div>
        </>
      )}
    </li>
  );
}
