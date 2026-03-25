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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');

    const { supabaseUrl, anonKey } = getPublicEnv();

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing Supabase env variables' },
        { status: 500 }
      );
    }

    const target = `${supabaseUrl}/rest/v1/songs?select=*${limit ? `&limit=${limit}` : ''}`;

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

    return NextResponse.json({ ok: true, data: body }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();

    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    const json = await req.json();

    const payload = {
      title: typeof json.title === 'string' ? json.title.trim() : '',
      melody: typeof json.melody === 'string' ? json.melody.trim() || null : null,
      author: typeof json.author === 'string' ? json.author.trim() || null : null,
      lyrics: typeof json.lyrics === 'string' ? json.lyrics.trim() : '',
      spotify_youtube:
        typeof json.spotify_youtube === 'string' ? json.spotify_youtube.trim() || null : null,
    };

    let isAdmin = false;

    if (token) {
      const access = await checkAdminAccess(token);
      isAdmin = access.isAdmin;
    }

    const table = isAdmin ? 'songs' : 'song_suggestions';
    const errorMessage = isAdmin ? 'Kunne ikke opprette sang' : 'Kunne ikke sende sangforslag';

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const insertBody = await insertRes.json().catch(() => null);

    if (!insertRes.ok) {
      return NextResponse.json(
        { ok: false, error: insertBody ?? errorMessage },
        { status: insertRes.status }
      );
    }

    if (!Array.isArray(insertBody) || insertBody.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: isAdmin ? 'Ingen rad ble opprettet' : 'Ingen forslag ble opprettet',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: insertBody[0],
        destination: table,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
