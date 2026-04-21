import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type Tag = {
  id: string;
  name: string;
};

// hooks for fetching, creating, editing and deleting tags
export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const body = await res.json();
    if (body.ok) setTags(body.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // checks if tag name already exists in the database
  const isDuplicate = (name: string, excludeId?: string) =>
    tags.some((t) => t.name.toLowerCase() === name.trim().toLowerCase() && t.id !== excludeId);

  const validate = (name: string, excludeId?: string): boolean => {
    if (isDuplicate(name, excludeId)) {
      toast.error('En tag med dette navnet finnes allerede');
      return false;
    }
    return true;
  };

  const createTag = async (name: string) => {
    if (!validate(name)) return false;
    setIsPending(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Opprettelse feilet');
      toast.success('Tag opprettet');
      await fetchTags();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kunne ikke opprette tag');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const updateTag = async (id: string, name: string) => {
    if (!validate(name, id)) return false;
    setIsPending(true);
    try {
      const deleteRes = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const deleteBody = await deleteRes.json().catch(() => null);
      if (!deleteRes.ok) throw new Error(deleteBody?.error ?? 'Oppdatering feilet');

      const createRes = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const createBody = await createRes.json();
      if (!createRes.ok) throw new Error(createBody?.error ?? 'Oppdatering feilet');

      toast.success('Tag oppdatert');
      await fetchTags();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kunne ikke oppdatere tag');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const deleteTag = async (tag: Tag) => {
    if (!confirm(`Er du sikker på at du vil slette taggen "${tag.name}"?`)) return false;
    setIsPending(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tag.id }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? 'Sletting feilet');
      toast.success('Tag slettet');
      await fetchTags();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kunne ikke slette tag');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { tags, isLoading, isPending, createTag, updateTag, deleteTag };
}
