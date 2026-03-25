import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

function getPublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing public Supabase env variables');
  }

  return { supabaseUrl, anonKey };
}

function getServiceEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing service Supabase env variables');
  }

  return { supabaseUrl, serviceRoleKey };
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { supabaseUrl, anonKey } = getPublicEnv();
    const { id } = await ctx.params;

    const target = `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}&select=*&limit=1`;

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

    const song = Array.isArray(body) ? body[0] : null;
    if (!song) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true, data: song }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env variables');
    }

    const { id } = await ctx.params;

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Mangler token' }, { status: 401 });
    }

    const json = await req.json();

    const payload = {
      title: typeof json.title === 'string' ? json.title.trim() : '',
      melody: typeof json.melody === 'string' ? json.melody.trim() || null : null,
      author: typeof json.author === 'string' ? json.author.trim() || null : null,
      lyrics: typeof json.lyrics === 'string' ? json.lyrics.trim() : '',
      spotify_youtube:
        typeof json.spotify_youtube === 'string' ? json.spotify_youtube.trim() || null : null,
    };

    const { isAdmin } = await checkAdminAccess(token);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Du har ikke tilgang til å redigere sanger' },
        { status: 403 }
      );
    }

    const updateRes = await fetch(`${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const updateBody = await updateRes.json().catch(() => null);

    if (!updateRes.ok) {
      return NextResponse.json(
        { ok: false, error: updateBody ?? 'Kunne ikke oppdatere sang' },
        { status: updateRes.status }
      );
    }

    if (!Array.isArray(updateBody) || updateBody.length === 0) {
      return NextResponse.json({ ok: false, error: 'Ingen rad ble oppdatert' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: updateBody[0] }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();
    const { id } = await ctx.params;

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Mangler token' }, { status: 401 });
    }

    const { isAdmin } = await checkAdminAccess(token);

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Du har ikke tilgang til å slette sanger' },
        { status: 403 }
      );
    }

    const target = `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`;

    const res = await fetch(target, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Nothing deleted (id not found)' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: body[0] }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
