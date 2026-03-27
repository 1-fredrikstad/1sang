import { NextResponse } from 'next/server';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env variables');
  }

  return { supabaseUrl, anonKey };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const playlistId = url.searchParams.get('playlist_id');

    const { supabaseUrl, anonKey } = getEnv();

    let target = `${supabaseUrl}/rest/v1/playlist_items?select=*`;

    if (playlistId) {
      target += `&playlist_id=eq.${encodeURIComponent(playlistId)}`;
    }

    if (limit) {
      target += `&limit=${encodeURIComponent(limit)}`;
    }

    const res = await fetch(target, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
      },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { supabaseUrl, anonKey } = getEnv();
    const payload = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_add_item`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_playlist_id: payload.playlist_id,
        p_password: payload.password,
        p_song_id: payload.song_id,
      }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body ?? null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabaseUrl, anonKey } = getEnv();
    const payload = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_remove_item`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_playlist_id: payload.playlist_id,
        p_password: payload.password,
        p_song_id: payload.song_id,
      }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body ?? null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
