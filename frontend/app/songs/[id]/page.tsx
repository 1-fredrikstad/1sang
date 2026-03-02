'use client';
import { useParams } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Song } from '@/src/lib/db';
import './page.css';
import BackButton from '@/src/components/BackButton';

export default function SongPage() {
  const { id } = useParams<{ id: string }>();

  const song = useLiveQuery<Song | undefined>(() => (id ? db.songs.get(id) : undefined), [id]);

  if (!song) return <div>Laster sang...</div>;

  return (
    <main>
      <h1>{song.title}</h1>
      <BackButton />
      <div>
        <p style={{ opacity: 0.6, marginTop: '2px' }}>
          {song.melody ? `Melodi: ${song.melody}` : ''}
        </p>
        <pre>{song.lyrics || 'Ingen sangtekst'}</pre>
      </div>
      <p id="forfatter" style={{ opacity: 0.6 }}>
        Skrevet av: {song.author || song.melody}
      </p>
    </main>
  );
}
