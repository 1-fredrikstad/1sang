import { NextResponse } from 'next/server';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    throw new Error('Missing Supabase env variables');
  }

  return { supabaseUrl, publishableKey };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');

    const { supabaseUrl, publishableKey } = getEnv();

    const target = `${supabaseUrl}/rest/v1/song_suggestions?select=*${limit ? `&limit=${limit}` : ''}`;

    const res = await fetch(target, {
      headers: {
        apikey: publishableKey,
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
    const { supabaseUrl, publishableKey } = getEnv();
    const json = await req.json();

    const payload = {
      title: json.title ?? '',
      melody: json.melody ?? null,
      author: json.author ?? null,
      lyrics: json.lyrics ?? '',
    };

    const target = `${supabaseUrl}/rest/v1/song_suggestions`;

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
