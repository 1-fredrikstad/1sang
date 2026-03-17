import { NextResponse } from 'next/server';
import { isAdminUser } from '@/src/lib/supabase/isAdminUser';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ ok: true, isAdmin: false }, { status: 200 });
    }

    const { isAdmin } = await isAdminUser(token);

    return NextResponse.json({ ok: true, isAdmin }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
