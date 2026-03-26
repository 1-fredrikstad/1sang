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
    const { supabaseUrl, anonKey } = getEnv();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    let target =
      `${supabaseUrl}/rest/v1/playlists` +
      `?select=id,title,created_at,updated_at,version,is_public,expires_at`;

    if (id) {
      target += `&id=eq.${encodeURIComponent(id)}`;
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
    const { action, ...payload } = await req.json();

    let rpcName = '';
    let rpcBody: unknown = {};

    switch (action) {
      case 'create':
        rpcName = 'playlists_create';
        rpcBody = {
          p_title: payload.title,
          p_password: payload.password,
          p_is_public: payload.is_public,
          p_expires_at: payload.expires_at,
        };
        break;

      case 'add_item':
        rpcName = 'playlists_add_item';
        rpcBody = {
          p_playlist_id: payload.playlist_id,
          p_password: payload.password,
          p_song_id: payload.song_id,
        };
        break;

      case 'remove_item':
        rpcName = 'playlists_remove_item';
        rpcBody = {
          p_playlist_id: payload.playlist_id,
          p_password: payload.password,
          p_song_id: payload.song_id,
        };
        break;

      case 'delete':
        rpcName = 'playlists_delete';
        rpcBody = {
          p_playlist_id: payload.playlist_id,
          p_password: payload.password,
        };
        break;

      default:
        return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${rpcName}`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rpcBody),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) return NextResponse.json({ ok: false, error: body }, { status: res.status });

    return NextResponse.json({ ok: true, data: body ?? null }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
