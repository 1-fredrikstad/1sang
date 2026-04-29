import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';
import { capitalizeFirst } from '@/src/lib/utils/capitalizeFormat';

// Public key for read operations (RLS applies)
function getPublicEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing public Supabase env variables');
  }

  return { supabaseUrl, anonKey };
}

// Service role key for admin mutations (bypasses RLS)
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
    const versesInput = json.verses as unknown;

    const payload = {
      title: typeof json.title === 'string' ? capitalizeFirst(json.title.trim()) : '',
      melody: typeof json.melody === 'string' ? capitalizeFirst(json.melody.trim()) || null : null,
      author: typeof json.author === 'string' ? capitalizeFirst(json.author.trim()) || null : null,
      chorus: typeof json.chorus === 'string' ? json.chorus.trim() : '',
      verses: Array.isArray(versesInput)
        ? (versesInput as string[]).map((v: string) => v.trim()).filter((v: string) => v.length > 0)
        : [],
      spotify_youtube:
        typeof json.spotify_youtube === 'string' ? json.spotify_youtube.trim() || null : null,
      has_chords: typeof json.has_chords === 'boolean' ? json.has_chords : false,
    };

    const finalTags = Array.isArray(json.tags)
      ? json.tags.filter((tagId: unknown): tagId is string => typeof tagId === 'string')
      : [];

    const { isAdmin } = await checkAdminAccess(token);

    // Only admins are allowed to modify songs
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

    // Fjern gamle tags sangen har for å legge på nye
    const deleteTagsRes = await fetch(
      `${supabaseUrl}/rest/v1/song_tags?song_id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json',
        },
      }
    );

    const deleteTagsBody = await deleteTagsRes.json().catch(() => null);

    if (!deleteTagsRes.ok) {
      return NextResponse.json(
        { ok: false, error: deleteTagsBody ?? 'Kunne ikke slette gamle tag-relasjoner' },
        { status: deleteTagsRes.status }
      );
    }

    // Legg inn nye tag-relasjoner
    if (finalTags.length > 0) {
      const tagRows = finalTags.map((tagId: string) => ({
        song_id: id,
        tag_id: tagId,
      }));

      const insertTagsRes = await fetch(`${supabaseUrl}/rest/v1/song_tags`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(tagRows),
      });

      const insertTagsBody = await insertTagsRes.json().catch(() => null);

      if (!insertTagsRes.ok) {
        return NextResponse.json(
          { ok: false, error: insertTagsBody ?? 'Kunne ikke legge til tag-relasjoner' },
          { status: insertTagsRes.status }
        );
      }
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

    // Only admins are allowed to delete songs
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
        // Return deleted row for confirmation
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
