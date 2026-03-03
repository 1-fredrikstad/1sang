'use client';
import { useState, useEffect, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthContext } from './AuthContext';

export const AuthProviderInner = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
        });
      }

      setIsLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
        });
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
  );
};
