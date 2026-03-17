import { NextResponse } from 'next/server';
import { checkUser } from '@/src/lib/supabase/isUser';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ ok: true, isUser: false }, { status: 200 });
    }

    const { isUser } = await checkUser(token);

    return NextResponse.json({ ok: true, isUser }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
