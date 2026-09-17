import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authStatus, setAuthStatus] = useState('LOADING'); // 'LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'
  const [authError, setAuthError] = useState(null);

  // Helper: Fetch user profile from Supabase 'profiles' table
  const fetchProfile = useCallback(async (userId) => {
    if (!userId || !isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AI-RailLink] Could not fetch profile from Supabase:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[AI-RailLink] Error in fetchProfile:', err);
      return null;
    }
  }, []);

  // Helper: Sync Google / metadata profile into 'profiles' table
  const syncUserProfile = useCallback(async (authUser) => {
    if (!authUser || !isSupabaseConfigured) return null;

    try {
      // 1. Check if profile already exists
      const existingProfile = await fetchProfile(authUser.id);

      // Extract metadata provided by Google OAuth or email sign-up
      const meta = authUser.user_metadata || {};
      const fullName =
        existingProfile?.full_name ||
        meta.full_name ||
        meta.name ||
        authUser.email?.split('@')[0] ||
        'Researcher';
      const avatarUrl =
        existingProfile?.avatar_url ||
        meta.avatar_url ||
        meta.picture ||
        null;

      // 2. If profile is missing or avatar is new from Google, upsert to profiles
      if (!existingProfile || (!existingProfile.avatar_url && avatarUrl)) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert(
            {
              id: authUser.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          )
          .select()
          .maybeSingle();

        if (error) {
          console.warn('[AI-RailLink] Upsert profile error:', error.message);
          return existingProfile || { full_name: fullName, avatar_url: avatarUrl };
        }
        return data;
      }

      return existingProfile;
    } catch (err) {
      console.warn('[AI-RailLink] Error syncing user profile:', err);
      return null;
    }
  }, [fetchProfile]);

  // Initial session check and active listener for Supabase auth events
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setAuthStatus('UNAUTHENTICATED');
      return;
    }

    async function initializeAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.warn('[AI-RailLink] Failed to get session:', error.message);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthStatus('UNAUTHENTICATED');
          }
          return;
        }

        if (initialSession?.user) {
          const userProfile = await syncUserProfile(initialSession.user);
          if (isMounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            setProfile(userProfile);
            setAuthStatus('AUTHENTICATED');
          }
        } else {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setAuthStatus('UNAUTHENTICATED');
          }
        }
      } catch (err) {
        console.error('[AI-RailLink] Auth init error:', err);
        if (isMounted) {
          setAuthStatus('UNAUTHENTICATED');
        }
      }
    }

    initializeAuth();

    // Listen for auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          if (currentSession?.user) {
            const userProfile = await syncUserProfile(currentSession.user);
            setSession(currentSession);
            setUser(currentSession.user);
            setProfile(userProfile);
            setAuthStatus('AUTHENTICATED');
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setAuthStatus('UNAUTHENTICATED');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [syncUserProfile]);

  // Clean, user-friendly error formatting helper
  const formatAuthError = (err) => {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const msg = err.message || '';
    if (msg.toLowerCase().includes('invalid login credentials')) {
      return 'Invalid email address or password. Please verify your credentials.';
    }
    if (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists')) {
      return 'An account with this email address already exists. Please log in instead.';
    }
    if (msg.toLowerCase().includes('password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.toLowerCase().includes('rate limit')) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    if (msg.toLowerCase().includes('email not confirmed')) {
      return 'Please verify your email address to log in, or check Supabase Auth settings.';
    }
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
      return 'Network error: Unable to connect to authentication servers. Check your internet connection.';
    }
    return msg;
  };

  // 1. Email + Password Login
  const login = async ({ email, password }) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
    }

    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      const friendlyMsg = formatAuthError(error);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }

    // Sync profile immediately
    const userProfile = await syncUserProfile(data.user);
    setSession(data.session);
    setUser(data.user);
    setProfile(userProfile);
    setAuthStatus('AUTHENTICATED');

    return { user: data.user, session: data.session };
  };

  // 2. Email + Password Registration
  const register = async ({ name, email, password }) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not yet configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
      );
    }

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedName) {
      throw new Error('Please enter your full name.');
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Call official supabase.auth.signUp() passing user_metadata for trigger & profiles
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      const friendlyMsg = formatAuthError(error);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }

    // If user record is created, insert/upsert to profiles table directly
    if (data.user) {
      try {
        await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            full_name: trimmedName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (profileErr) {
        console.warn('[AI-RailLink] Note: Profile creation via client:', profileErr);
      }

      if (data.session) {
        const userProfile = await syncUserProfile(data.user);
        setSession(data.session);
        setUser(data.user);
        setProfile(userProfile);
        setAuthStatus('AUTHENTICATED');
      }
    }

    return {
      user: data.user,
      session: data.session,
      emailConfirmationRequired: !data.session,
    };
  };

  // 3. Google Sign-In with OAuth
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
      );
    }

    // Use current origin so it works in both localhost and production Vercel
    const redirectUrl = window.location.origin;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      const friendlyMsg = formatAuthError(error);
      setAuthError(friendlyMsg);
      throw new Error(friendlyMsg);
    }

    return data;
  };

  // 4. Logout
  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AI-RailLink] SignOut warning:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setAuthStatus('UNAUTHENTICATED');
    }
  };

  // Normalized currentUser object for components
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
    // Session and User
    session,
    user,
    profile,
    currentUser,

    // Status flags
    loading: authStatus === 'LOADING',
    authStatus,
    isAuthenticated: authStatus === 'AUTHENTICATED',
    isSupabaseConfigured,
    authError,

    // Actions
    login,
    register,
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
