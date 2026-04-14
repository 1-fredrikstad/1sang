import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ ok: false, error: 'Mangler token' }, { status: 401 });
    }

    const access = await checkAdminAccess(token);

    if (!access.userId || !access.isSuperuser) {
      return NextResponse.json({ ok: false, error: 'Ikke tilgang' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env variables');
    }

    const usersRes = await fetch(
      `${supabaseUrl}/rest/v1/users?select=user_id,name,email,role&order=name.asc`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json',
        },
      }
    );

    const usersBody = await usersRes.json().catch(() => null);

    if (!usersRes.ok) {
      throw new Error('Kunne ikke hente brukere');
    }

    return NextResponse.json({
      ok: true,
      data: Array.isArray(usersBody) ? usersBody : [],
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Noe gikk galt' },
      { status: 500 }
    );
  }
}
