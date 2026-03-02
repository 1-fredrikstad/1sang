import Link from 'next/link';
import { createClient } from '../../src/lib/supabase/server';

export async function HomePage() {
  const supabase = await createClient();
  const { data: songs } = await supabase.from('songs').select();

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Song List</h1>

      <ul className="w-full space-y-4">
        {songs?.map((song) => (
          <li
            key={song.id}
            className="bg-[#3F3F3F] rounded-xl shadow hover:shadow-md active:scale-[0.99] transition"
          >
            <Link href={`/songs/${song.id}`} className="block w-full py-4 pr-30 pl-4 text-left">
              {song.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
