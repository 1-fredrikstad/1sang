'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import SongForm from '@/src/components/SongForm';
import { useAuth } from '@/src/context/AuthContext';
import BackButton from '@/src/components/BackButton';
import { createClient } from '@/src/lib/supabase/client';
import { DeleteSongButton } from '@/src/components/DeleteSongButton';
import { useState } from 'react';

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();
  const [isDeletingSong, setIsDeletingSong] = useState(false);

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

  const songTags = useLiveQuery(async () => {
    if (!id) return [];

    const relations = await db.song_tags.where('song_id').equals(id).toArray();
    const tagIds = relations.map((r) => r.tag_id);

    if (tagIds.length === 0) return [];

    const resolvedTags = await db.tags.where('id').anyOf(tagIds).toArray();

    return resolvedTags;
  }, [id]);

  if (isLoading) {
    return <p className="text-center mt-10">Laster...</p>;
  }

  if (!isAdmin) {
    return <p className="text-center mt-10">Ingen tilgang.</p>;
  }

  if (isDeletingSong) return null;
  if (!song) {
    return <p className="text-center mt-10">Fant ikke sang.</p>;
  }

  if (!song || songTags === undefined) {
    return <p className="text-center mt-10">Laster...</p>;
  }

  const handleSubmit = async (data: {
    title: string;
    melody?: string;
    author?: string;
    lyrics: string;
    tags?: string[];
  }) => {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (!token) {
      throw new Error('Ikke logget inn');
    }

    const res = await fetch(`/api/songs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      console.log('Kunne ikke oppdatere sang:', body);
      throw new Error(typeof body?.error === 'string' ? body.error : 'Kunne ikke oppdatere sang');
    }

    await db.songs.update(id, {
      title: data.title,
      melody: data.melody || undefined,
      author: data.author || undefined,
      lyrics: data.lyrics,
    });

    await db.song_tags.where('song_id').equals(id).delete();

    if (data.tags && data.tags.length > 0) {
      await db.song_tags.bulkAdd(
        data.tags.map((tagId) => ({
          song_id: id,
          tag_id: tagId,
        }))
      );
    }

    router.push(`/songs/${id}`);
  };

  return (
    <main className="relative w-full max-w-300 mx-auto px-4">
      <div className="absolute left-5 cursor-pointer">
        <BackButton />
      </div>

      <SongForm
        heading="Rediger sang"
        submitLabel="Lagre endringer"
        toastSuccessMessage="Sang oppdatert"
        showTags={isAdmin}
        initialValues={{
          title: song.title,
          melody: song.melody ?? '',
          author: song.author ?? '',
          lyrics: song.lyrics ?? '',
          tags: songTags ?? [],
        }}
        onSubmit={handleSubmit}
      />
      <div className="flex justify-center">
        <DeleteSongButton
          songId={song.id}
          className="danger"
          onDeletingChange={setIsDeletingSong}
        />
      </div>
    </main>
  );
}
