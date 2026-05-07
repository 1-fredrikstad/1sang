import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';
import { capitalizeFirst } from '@/src/lib/utils/capitalizeFormat';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env variables');
  }
  return { supabaseUrl, anonKey };
}

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  return token || null;
}

async function getIsAdmin(req: Request) {
  const token = getBearerToken(req);
  if (!token) return false;

  try {
    const { isAdmin } = await checkAdminAccess(token);
    return isAdmin;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { supabaseUrl, anonKey } = getEnv();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    let res: Response;

    // If id is provided, fetch playlist detail; otherwise return public playlist list
    if (id) {
      res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_get_detail`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_playlist_id: id,
        }),
      });
    } else {
      res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_list_public`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    }

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
    const isAdmin = await getIsAdmin(req);

    let rpcName = '';
    let rpcBody: unknown = {};

    // Single endpoint handling multiple playlist actions via RPC mapping
    switch (action) {
      case 'create':
        rpcName = 'playlists_create';
        rpcBody = {
          p_title: capitalizeFirst(payload.title),
          p_password: payload.password,
          p_is_public: payload.is_public,
          p_expires_at: payload.expires_at,
        };
        break;

      case 'add_item':
        // Admins bypass password-based RPC variants
        rpcName = isAdmin ? 'playlists_admin_add_item' : 'playlists_add_item';
        rpcBody = isAdmin
          ? {
              p_playlist_id: payload.playlist_id,
              p_song_id: payload.song_id,
            }
          : {
              p_playlist_id: payload.playlist_id,
              p_password: payload.password,
              p_song_id: payload.song_id,
            };
        break;

      case 'remove_item':
        rpcName = isAdmin ? 'playlists_admin_remove_item' : 'playlists_remove_item';
        rpcBody = isAdmin
          ? {
              p_playlist_id: payload.playlist_id,
              p_song_id: payload.song_id,
            }
          : {
              p_playlist_id: payload.playlist_id,
              p_password: payload.password,
              p_song_id: payload.song_id,
            };
        break;

      case 'delete':
        rpcName = isAdmin ? 'playlists_admin_delete' : 'playlists_delete';
        rpcBody = isAdmin
          ? {
              p_playlist_id: payload.playlist_id,
            }
          : {
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
