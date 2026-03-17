'use client';
import { useState, useEffect, ReactNode, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthContext } from './AuthContext';

export const AuthProviderInner = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    const supabase = createClient();
    isMounted.current = true;

    const fetchAdminStatus = async (accessToken: string) => {
      const res = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = await res.json().catch(() => null);

      if (!isMounted.current) return;
      setIsAdmin(body?.isAdmin === true);
    };

    const updateAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted.current) return;

      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
        });

        if (session.access_token) {
          await fetchAdminStatus(session.access_token);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      setIsLoading(false);
    };

    updateAuthState();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted.current) return;

      setIsLoading(true);

      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
        });

        if (session.access_token) {
          await fetchAdminStatus(session.access_token);
        } else {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }

      if (!isMounted.current) return;
      setIsLoading(false);
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
    setIsAdmin(false);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
