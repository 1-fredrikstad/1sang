'server-only';

import { createClient } from '../supabase/server';

export async function getCurrentUserRole() {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.CYPRESS_E2E === 'true' &&
    process.env.CYPRESS_ADMIN === 'true'
  ) {
    return { isUser: true, role: 'admin' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isUser: false, role: null };

  // Use service role key to bypass RLS on the users table
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return { isUser: false, role: null };

  const res = await fetch(
    `${supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    }
  );

  const body = await res.json().catch(() => null);
  const role = Array.isArray(body) && body.length > 0 ? body[0].role : null;

  return { isUser: role !== null, role };
}

export async function requireAdmin() {
  const { role } = await getCurrentUserRole();
  if (role !== 'admin' && role !== 'superuser') throw new Error('Only admin has access');

  return true;
}
