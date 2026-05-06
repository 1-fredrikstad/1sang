import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { error } = await supabase.from('songs').select('id').limit(1);

  if (error) {
    console.error(error);
    return new Response('error', { status: 500 });
  }

  return new Response('ok');
}
