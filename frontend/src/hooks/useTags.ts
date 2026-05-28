import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { syncService } from '@/src/lib/syncService';
import { createClient } from '@/src/lib/supabase/client';

export type Tag = {
  id: string;
  name: string;
};

// hooks for fetching, creating, editing and deleting tags
export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // Fetch all tags from API
  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const body = await res.json();
    if (body.ok) setTags(body.data);
    setIsLoading(false);
  };

  // Sync Dexie so offline/local cache stays consistent
  const syncDexieTags = () => syncService.syncTable('tags', { forceFresh: true });

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  };

  useEffect(() => {
    fetchTags(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // Check if tag name already exists (case-insensitive)
  const isDuplicate = (name: string, excludeId?: string) =>
    tags.some((t) => t.name.toLowerCase() === name.trim().toLowerCase() && t.id !== excludeId);

  // Validate tag input before sending to API
  const validate = (name: string, excludeId?: string): boolean => {
    if (isDuplicate(name, excludeId)) {
      toast.error('En tag med dette navnet finnes allerede');
      return false;
    }
    return true;
  };

  // Create new tag
  const createTag = async (name: string) => {
    if (!validate(name)) return false;

    setIsPending(true);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ name: name.trim() }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Opprettelse feilet');

      // Update local state directly from API response — no re-fetch needed
      const created = Array.isArray(body.data) ? body.data[0] : body.data;
      if (created) setTags((prev) => [...prev, created]);

      toast.success('Tag opprettet');
      await syncDexieTags();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kunne ikke opprette tag');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  // Update existing tag
  const updateTag = async (id: string, name: string) => {
    if (!validate(name, id)) return false;

    setIsPending(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: name.trim() }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Oppdatering feilet');

      setTags((prev) => prev.map((t) => (t.id === id ? { ...t, name: name.trim() } : t)));

      toast.success('Tag oppdatert');
      await syncDexieTags();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Kunne ikke oppdatere tag');
      return false;
    } finally {
      setIsPending(false);
    }
  };

  // Delete tag after confirmation
  const deleteTag = async (tag: Tag) => {
    if (!confirm(`Er du sikker på at du vil slette taggen "${tag.name}"?`)) return false;

    setIsPending(true);
    try {
      const authHeader = await getAuthHeader();
      const res = await fetch('/api/tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id: tag.id }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? 'Sletting feilet');

      setTags((prev) => prev.filter((t) => t.id !== tag.id));

      toast.success('Tag slettet');
      await syncDexieTags();
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
