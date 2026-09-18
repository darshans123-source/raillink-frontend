import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper: Synchronize Google user profile to Supabase 'profiles' table
  const syncUserProfile = useCallback(async (authUser) => {
    if (!authUser?.id) return null;

    try {
      const meta = authUser.user_metadata || {};
      const fullName =
        meta.full_name ||
        meta.name ||
        authUser.email?.split('@')[0] ||
        'Researcher';
      const avatarUrl =
        meta.avatar_url ||
        meta.picture ||
        null;

      const profileRecord = {
        id: authUser.id,
        full_name: fullName,
        email: authUser.email || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileRecord, { onConflict: 'id' })
        .select('id, full_name, email, avatar_url, created_at, updated_at')
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Profile sync notice:', error.message);
        return profileRecord;
      }
      return data || profileRecord;
    } catch (err) {
      console.warn('[AuthContext] syncUserProfile error:', err);
      return null;
    }
  }, []);

  // 1. Application startup: getSession() and onAuthStateChange()
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Call getSession() on startup
    supabase.auth
      .getSession()
      .then(({ data: { session: activeSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[AuthContext] getSession error:', error.message);
        }
        setSession(activeSession);
        setUser(activeSession?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[AuthContext] getSession failure:', err);
        setLoading(false);
      });

    // Subscribe to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return;
      console.log(
        '[AuthContext] onAuthStateChange event:',
        event,
        'hasSession:',
        Boolean(currentSession)
      );
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    // Unsubscribe when component unmounts
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Sync profile whenever active user changes
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      syncUserProfile(user).then((p) => {
        if (isMounted && p) {
          setProfile(p);
        }
      });
    } else {
      setProfile(null);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id, syncUserProfile]);

  // 3. Real Supabase Google OAuth sign-in
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('[AuthContext] Google sign-in failed:', error.message);
        setAuthError(error.message);
        throw error;
      }

      return data;
    } catch (err) {
      setAuthError(err.message || 'Google sign-in encountered an error.');
      throw err;
    }
  };

  // 4. Logout via Supabase signOut
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthContext] signOut notice:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  // Normalized currentUser for UI headers and components
  const currentUser = user
    ? {
        id: user.id,
        name:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Researcher',
        email: user.email,
        avatarUrl:
          profile?.avatar_url ||
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null,
      }
    : null;

  const value = {
    session,
    user,
    profile,
    currentUser,
    loading,
    isAuthenticated: Boolean(session),
    authError,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
