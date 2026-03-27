import { NextResponse } from 'next/server';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env variables');
  }

  return { supabaseUrl, anonKey };
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUrl, anonKey } = getEnv();

    const target =
      `${supabaseUrl}/rest/v1/playlists` +
      `?select=id,title,is_public,expires_at,created_at,updated_at,version` +
      `&id=eq.${encodeURIComponent(id)}`;

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

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_update`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_playlist_id: id,
        p_current_password: payload.password,
        p_new_password: payload.newPassword ?? '',
        p_title: payload.title,
        p_is_public: payload.is_public,
        p_expires_at: payload.expires_at,
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

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const { supabaseUrl, anonKey } = getEnv();
    const payload = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_delete`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_playlist_id: id,
        p_password: payload.password,
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
