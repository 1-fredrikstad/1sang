'server-only';

import { createClient } from '../supabase/server';

export async function getCurrentUserRole() {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.CYPRESS_E2E === 'true' &&
    process.env.NEXT_PUBLIC_CYPRESS_ADMIN === 'true'
  ) {
    return { isUser: true, role: 'admin' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isUser: false, role: null };

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw new Error('Could not fetch role');

  return { isUser: !!data, role: data?.role ?? null };
}

export async function requireAdmin() {
  const { role } = await getCurrentUserRole();
  if (role !== 'admin' && role !== 'superuser') throw new Error('Only admin has access');

  return true;
}
