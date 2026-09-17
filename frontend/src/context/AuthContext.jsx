import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Helper: Synchronize minimal Google user profile to Supabase 'profiles' table
  const syncUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) return null;

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
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileRecord, { onConflict: 'id' })
        .select('id, full_name, avatar_url, created_at, updated_at')
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Profile sync notice:', error.message);
        return {
          id: authUser.id,
          full_name: fullName,
          avatar_url: avatarUrl,
        };
      }
      return data;
    } catch (err) {
      console.warn('[AuthContext] syncUserProfile error:', err);
      return null;
    }
  }, []);

  // Application startup: restore session and listen to real-time auth changes
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      console.warn('[AuthContext] Supabase credentials not configured; defaulting to unauthenticated.');
      setLoading(false);
      return;
    }

    // Check if URL currently has OAuth callback parameters (e.g. ?code= or #access_token=)
    const isOAuthCallback =
      typeof window !== 'undefined' &&
      (window.location.search.includes('code=') ||
       window.location.hash.includes('access_token=') ||
       window.location.hash.includes('refresh_token='));

    // 1. Subscribe to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        console.log('[AuthContext] onAuthStateChange event:', event, 'hasSession:', Boolean(currentSession));

        // When returning from Google OAuth, keep loading true during initial null session until code exchange completes
        if (event === 'INITIAL_SESSION' && isOAuthCallback && !currentSession) {
          console.log('[AuthContext] Google OAuth exchange in progress, holding loading state.');
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    // 2. Call getSession() on startup (awaits OAuth code exchange if present in URL)
    supabase.auth.getSession().then(({ data: { session: activeSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('[AuthContext] getSession error:', error.message);
      }
      if (activeSession) {
        setSession(activeSession);
        setUser(activeSession.user ?? null);
      } else if (!isOAuthCallback) {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    }).catch((err) => {
      if (!isMounted) return;
      console.error('[AuthContext] getSession failure:', err);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Background profile synchronization on authenticated user change
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

  // Google OAuth Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please check environment variables.');
    }

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
  };

  // Logout with Supabase signOut()
  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] signOut warning:', err);
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
    isSupabaseConfigured,
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
