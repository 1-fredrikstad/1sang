import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase.from('songs').select('id').limit(1);

  if (error) {
    console.error('SUPABASE ERROR:', error);
    return new Response('error', { status: 500 });
  }

  console.log('Supabase hit at', new Date().toISOString());

  return Response.json({ ok: true, data });
}
