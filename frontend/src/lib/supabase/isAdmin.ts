import 'server-only';

type CheckAdminAccessResult = {
  userId: string | null;
  role: string | null;
  isAdmin: boolean;
};

export async function checkAdminAccess(token: string): Promise<CheckAdminAccessResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    throw new Error('Missing Supabase env variables');
  }

  // 1. Get authenticated user
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  const userBody = await userRes.json().catch(() => null);

  if (!userRes.ok || !userBody?.id) {
    return {
      userId: null,
      role: null,
      isAdmin: false,
    };
  }

  const userId = userBody.id;

  // 2. Get role from users table
  const roleRes = await fetch(
    `${supabaseUrl}/rest/v1/users?user_id=eq.${encodeURIComponent(userId)}&select=role&limit=1`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
    }
  );

  const roleBody = await roleRes.json().catch(() => null);

  if (!roleRes.ok) {
    throw new Error('Kunne ikke sjekke brukerrolle');
  }

  const role = Array.isArray(roleBody) && roleBody.length > 0 ? roleBody[0].role : null;

  return {
    userId,
    role,
    isAdmin: role === 'admin' || role === 'superuser',
  };
}
