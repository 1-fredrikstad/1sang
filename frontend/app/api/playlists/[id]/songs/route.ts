import { Song } from '@/src/lib/db';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    // Fail fast if Supabase configuration is missing
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: false, error: 'Missing env vars' }, { status: 500 });
    }

    const params = await ctx.params;
    const id = params.id;

    // Prevent invalid or uninitialized route params from hitting Supabase
    if (!id || typeof id !== 'string' || id.length < 10 || id === 'undefined') {
      return NextResponse.json(
        { ok: false, error: 'Missing or invalid playlist id' },
        { status: 400 }
      );
    }
    // Fetch playlist items with song data and ensure correct ordering
    const target = `${supabaseUrl}/rest/v1/playlist_items?playlist_id=eq.${encodeURIComponent(
      id
    )}&select=position,songs(*)&order=position.asc`;

    const res = await fetch(target, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      console.error('Supabase error:', errorBody);
      return NextResponse.json({ ok: false, error: errorBody }, { status: res.status });
    }

    const body = await res.json();

    type PlaylistItemResponse = {
      position: number;
      songs: Song;
    };

    // Flatten joined song data into a client-friendly structure
    const items = body
      .filter((item: PlaylistItemResponse) => item.songs)
      .map((item: PlaylistItemResponse) => ({
        ...item.songs,
        position: item.position,
      }));

    return NextResponse.json({ ok: true, data: items });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
