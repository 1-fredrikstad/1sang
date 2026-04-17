import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/src/lib/supabase/isAdmin';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json(
        {
          ok: true,
          userId: null,
          role: null,
          isAdmin: false,
          isSuperuser: false,
        },
        { status: 200 }
      );
    }

    const { userId, role, isAdmin, isSuperuser } = await checkAdminAccess(token);

    return NextResponse.json(
      {
        ok: true,
        userId,
        role,
        isAdmin,
        isSuperuser,
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
