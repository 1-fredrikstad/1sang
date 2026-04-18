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

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUrl, anonKey } = getEnv();

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_get_detail`, {
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

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body?.[0] ?? null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUrl, anonKey } = getEnv();
    const payload = await req.json();
    const isAdmin = await getIsAdmin(req);

    const rpcName = isAdmin ? 'playlists_admin_update' : 'playlists_update';

    const rpcBody = isAdmin
      ? {
          p_playlist_id: id,
          p_new_password: payload.newPassword ?? '',
          p_title: capitalizeFirst(payload.title),
          p_is_public: payload.is_public,
          p_expires_at: payload.expires_at,
        }
      : {
          p_playlist_id: id,
          p_current_password: payload.password,
          p_new_password: payload.newPassword ?? '',
          p_title: payload.title,
          p_is_public: payload.is_public,
          p_expires_at: payload.expires_at,
        };

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

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body ?? null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUrl, anonKey } = getEnv();
    const payload = await req.json();
    const isAdmin = await getIsAdmin(req);

    const rpcName = isAdmin ? 'playlists_admin_delete' : 'playlists_delete';

    const rpcBody = isAdmin
      ? {
          p_playlist_id: id,
        }
      : {
          p_playlist_id: id,
          p_password: payload.password,
        };

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

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body ?? null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
