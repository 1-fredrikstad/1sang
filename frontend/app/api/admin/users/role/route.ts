import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

const ALLOWED_ROLES = ['user', 'admin'] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

export async function PATCH(req: NextRequest) {
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

    const body = await req.json().catch(() => null);
    const targetUserId = body?.targetUserId;
    const role = body?.role;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Mangler bruker-ID' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Ugyldig rolle' }, { status: 400 });
    }

    if (targetUserId === access.userId) {
      return NextResponse.json(
        { ok: false, error: 'Du kan ikke endre din egen rolle her' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase env variables');
    }

    const checkTargetRes = await fetch(
      `${supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(
        targetUserId
      )}&select=user_id,role&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Accept: 'application/json',
        },
      }
    );

    const checkTargetBody = await checkTargetRes.json().catch(() => null);

    if (!checkTargetRes.ok) {
      throw new Error('Kunne ikke hente målbruker');
    }

    const targetUser =
      Array.isArray(checkTargetBody) && checkTargetBody.length > 0 ? checkTargetBody[0] : null;

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: 'Fant ikke bruker' }, { status: 404 });
    }

    if (targetUser.role === 'superuser') {
      return NextResponse.json(
        { ok: false, error: 'Superuser kan ikke endres her' },
        { status: 403 }
      );
    }

    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(targetUserId)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          role: role as AllowedRole,
        }),
      }
    );

    const updateBody = await updateRes.json().catch(() => null);

    if (!updateRes.ok) {
      throw new Error('Kunne ikke oppdatere rolle');
    }

    return NextResponse.json({
      ok: true,
      data: Array.isArray(updateBody) ? updateBody[0] : updateBody,
    });
  } catch (error) {
    console.error('PATCH /api/admin/users/role error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Noe gikk galt' },
      { status: 500 }
    );
  }
}
