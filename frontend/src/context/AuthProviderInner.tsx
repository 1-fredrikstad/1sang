'use client';
import { useState, useEffect, ReactNode, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthContext } from './AuthContext';

export const AuthProviderInner = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    const supabase = createClient();
    isMounted.current = true;

    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted.current) return;

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
      if (!isMounted.current) return;
      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      isMounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    if (!isMounted.current) return;
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    if (!isMounted.current) return;
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>{children}</AuthContext.Provider>
  );
};
