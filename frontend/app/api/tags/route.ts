import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

function getPublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing Supabase env variables');
  }
  return { supabaseUrl, anonKey };
}

function getServiceEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase env variables');
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

    const target = `${supabaseUrl}/rest/v1/tags?select=*${limit ? `&limit=${limit}` : ''}`;

    const res = await fetch(target, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
      },
    });

    const body = await res.json();
    if (!res.ok) return NextResponse.json({ ok: false, error: body }, { status: res.status });

    return NextResponse.json({ ok: true, data: body }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ ok: false, error: 'Mangler token' }, { status: 401 });
    const { isAdmin } = await checkAdminAccess(token);
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Ingen tilgang' }, { status: 403 });

    const { name } = await req.json().catch(() => ({}));
    if (!name) {
      return NextResponse.json({ ok: false, error: 'name of tag required' }, { status: 400 });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/tags`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ ok: false, error: body }, { status: res.status });

    return NextResponse.json({ ok: true, data: body }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ ok: false, error: 'Mangler token' }, { status: 401 });
    const { isAdmin } = await checkAdminAccess(token);
    if (!isAdmin) return NextResponse.json({ ok: false, error: 'Ingen tilgang' }, { status: 403 });

    const { id } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

    const target = `${supabaseUrl}/rest/v1/tags?id=eq.${encodeURIComponent(id)}`;

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

export async function PATCH(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing Supabase env variables' },
        { status: 500 }
      );
    }

    const { id, name } = await req.json().catch(() => ({}));
    if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
    if (!name) return NextResponse.json({ ok: false, error: 'name required' }, { status: 400 });

    // Update tag name (admin-level operation via service role)
    const target = `${supabaseUrl}/rest/v1/tags?id=eq.${encodeURIComponent(id)}`;

    const res = await fetch(target, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({ name }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ ok: false, error: body }, { status: res.status });

    return NextResponse.json({ ok: true, data: body[0] }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
