//app/api/song_suggestions/
import { NextResponse } from 'next/server';
import { normalizeSongInput, validateSongInput } from '@/src/lib/validation/songSuggestionSchema';
import { requireAdmin } from '@/src/lib/actions/auth';

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
    // Only admins are allowed to access song suggestions list
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Du har ikke tilgang til å se sangforslag' },
      { status: 403 }
    );
  }

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

    // Normalize input before running schema validation
    const data = normalizeSongInput(json);
    const errors = validateSongInput(data);

    const firstError = Object.values(errors)[0];
    // Return first validation error (fail fast)
    if (firstError) {
      return NextResponse.json({ ok: false, error: firstError }, { status: 400 });
    }

    // Convert empty optional fields to null for database consistency
    const payload = {
      title: data.title,
      melody: data.melody || null,
      author: data.author || null,
      chorus: data.chorus || null,
      verses: data.verses,
    };

    const target = `${supabaseUrl}/rest/v1/song_suggestions`;

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        apikey: publishableKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Insert-only request; no response body needed
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
