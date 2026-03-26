import { Song } from '@/src/lib/db';
import { NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: false, error: 'Missing env vars' }, { status: 500 });
    }

    const { id } = await ctx.params;

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

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    type PlaylistItemResponse = {
      position: number;
      songs: Song;
    };

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
