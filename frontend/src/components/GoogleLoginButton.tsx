'use client';

import { createClient } from '../lib/supabase/client';

export default function GoogleLoginButton() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Login error:', error);
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        backgroundColor: '#4285F4',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        fontWeight: 'bold',
      }}
    >
      Sign in with Google
    </button>
  );
}
