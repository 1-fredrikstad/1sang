'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import SongForm from '@/src/components/SongForm';
import { useAuth } from '@/src/context/AuthContext';
import BackButton from '@/src/components/BackButton';
import { DeleteSongButton } from '@/src/components/DeleteSongButton';

export default function EditSongPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

  if (isLoading) return <p className="text-center mt-10">Laster...</p>;
  if (!user) return <p className="text-center mt-10">Ingen tilgang.</p>;
  if (!song) return <p className="text-center mt-10">Fant ikke sang.</p>;

  return (
    <main className="relative w-full max-w-300 mx-auto px-4">
      <div className="absolute **:left-5 cursor-pointer">
        <BackButton />
      </div>
      <SongForm
        heading="Rediger sang"
        submitLabel="Lagre endringer"
        toastSuccessMessage="Sang oppdatert"
        initialValues={{
          title: song.title,
          melody: song.melody ?? '',
          author: song.author ?? '',
          lyrics: song.lyrics ?? '',
        }}
        onSubmit={async (data) => {
          await db.songs.update(id, {
            title: data.title,
            melody: data.melody,
            author: data.author,
            lyrics: data.lyrics,
          });
          router.push(`/songs/${id}`);
        }}
      />
      <DeleteSongButton songId={song.id} className="danger">
        Slett
      </DeleteSongButton>
    </main>
  );
}
