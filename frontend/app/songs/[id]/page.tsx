import { createClient } from '@/src/lib/supabase/server';
import './page.css';

export default async function SongPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: song } = await supabase.from('songs').select().eq('id', id).single();

  if (!song) return <div>Sang ikke funnet</div>;

  return (
    <main>
      <h1 className="h1">{song.title}</h1>
      <p>{song.artist}</p>
      <pre className="lyrics">{song.lyrics}</pre>
    </main>
  );
}
