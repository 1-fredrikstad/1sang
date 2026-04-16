'use client';
import { useState, useEffect, ReactNode, useRef } from 'react';
import { createClient } from '../lib/supabase/client';
import { AuthContext } from './AuthContext';
import { Spinner } from '@/components/ui/spinner';

type UserRole = 'user' | 'admin' | 'superuser' | null;

type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
};

export const AuthProviderInner = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isSuperuser, setIsSuperuser] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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
      setIsSuperuser(body?.isSuperuser === true);

      setUser((prev) =>
        prev
          ? {
              ...prev,
              role: body?.role ?? null,
            }
          : null
      );
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
          role: null,
        });

        if (session.access_token) {
          await fetchAdminStatus(session.access_token);
        } else {
          setIsAdmin(false);
          setIsSuperuser(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperuser(false);
      }

      setIsInitialized(true);
    };

    updateAuthState();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted.current) return;

      if (session?.user) {
        setUser({
          name: session.user.user_metadata.full_name ?? session.user.email ?? 'User',
          email: session.user.email ?? '',
          role: null,
        });

        if (session.access_token) {
          await fetchAdminStatus(session.access_token);
        } else {
          setIsAdmin(false);
          setIsSuperuser(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsSuperuser(false);
      }

      if (!isMounted.current) return;
    });

    return () => {
      isMounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    if (!isMounted.current) return;
    setUser(null);
    setIsAdmin(false);
    setIsSuperuser(false);
  };

  if (!isInitialized) {
    return <Spinner message="Laster inn" />;
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperuser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
