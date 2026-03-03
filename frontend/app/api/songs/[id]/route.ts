import { NextResponse } from 'next/server';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('Missing Supabase env variables');
  return { supabaseUrl, anonKey };
}

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { supabaseUrl, anonKey } = getEnv();
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

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { supabaseUrl, anonKey } = getEnv();
    const { id } = await ctx.params;

    const target = `${supabaseUrl}/rest/v1/songs?id=eq.${encodeURIComponent(id)}`;

    const res = await fetch(target, {
      method: 'DELETE',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
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
        { ok: false, error: 'Nothing deleted (id not found or RLS blocked)' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: body[0] }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
