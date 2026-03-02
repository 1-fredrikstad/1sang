'use client';
import { createClient } from '../../lib/supabase/client';
import Image from 'next/image';

export default function GoogleLoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/settings`, // redirect here after login
      },
    });
    if (error) console.error('Login error:', error);
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-[#F2F2F2] rounded-3xl py-2 px-3 hover:cursor-pointer"
    >
      <Image src="/google_logo.png" alt="Google logo" width={20} height={20} />
      Logg inn med Google
    </button>
  );
}
