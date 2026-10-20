import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export const LOCAL_USER = {
  id: 'local_garage_user',
  email: 'offline@lokal.garasi',
  user_metadata: { full_name: 'Pemilik Garasi' },
  isOffline: true,
};

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the app with an offline-first session state.
 * By default in mobile/offline mode, user is LOCAL_USER so the app never blocks
 * or requires any connection to a remote backend server.
 * Supabase auth is preserved optionally for Cloud Backup & Restore.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(LOCAL_USER);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // Fetch or refresh user profile from public.profiles
  const fetchProfile = async (userId) => {
    if (!userId || userId === LOCAL_USER.id) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 800));

    Promise.race([sessionPromise, timeoutPromise])
      .then((result) => {
        if (!isMounted || result?.timeout) return;
        const s = result?.data?.session;
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          setIsCloudConnected(true);
          fetchProfile(s.user.id);
        } else {
          setUser(LOCAL_USER);
          setIsCloudConnected(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(LOCAL_USER);
          setIsCloudConnected(false);
        }
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        if (!isMounted) return;
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          setIsCloudConnected(true);
          await fetchProfile(s.user.id);
        } else {
          setSession(null);
          setUser(LOCAL_USER);
          setProfile(null);
          setIsCloudConnected(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // --- Auth helpers ---

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      setIsCloudConnected(true);
      fetchProfile(data.user.id);
    }
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      setIsCloudConnected(true);
      fetchProfile(data.user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
    setUser(LOCAL_USER);
    setSession(null);
    setProfile(null);
    setIsCloudConnected(false);
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    isCloudConnected,
    isOffline: !isCloudConnected,
    cloudUser: isCloudConnected ? user : null,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume auth context */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
