import { NextResponse } from 'next/server';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env variables');
  }
  return { supabaseUrl, anonKey };
}

export async function POST(req: Request) {
  try {
    const { supabaseUrl, anonKey } = getEnv();
    const { playlist_id, password } = await req.json();

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/playlists_verify_password`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_playlist_id: playlist_id,
        p_password: password,
      }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: body }, { status: res.status });
    }

    return NextResponse.json({ ok: true, data: body }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
