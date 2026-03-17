import 'server-only';
export async function isAdminUser(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error('Missing Supabase env variables');
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  const userBody = await userRes.json().catch(() => null);

  if (!userRes.ok || !userBody?.id) {
    return { isAdmin: false, userId: null as string | null };
  }

  const userId = userBody.id;

  const adminRes = await fetch(
    `${supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(userId)}&select=user_id&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    }
  );

  const adminBody = await adminRes.json().catch(() => null);

  if (!adminRes.ok) {
    throw new Error('Kunne ikke sjekke admin-status');
  }

  return {
    isAdmin: Array.isArray(adminBody) && adminBody.length > 0,
    userId,
  };
}
