import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';
import { UserData } from '../types/user';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  session: authService.AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: UserData | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<authService.AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const loadProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId);
      setUser(profile);
      return profile;
    } catch (e) {
      console.error('Profile load failed', e);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user) {
        // 1. Set session INSTANTLY (Non-blocking)
        setSession({
          userId: currentSession.user.id,
          email: currentSession.user.email!,
        });

        // 2. Load profile in the background
        loadProfile(currentSession.user.id).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const s = await authService.signIn(email, password);
      setSession(s);
      // IMPORTANT: Fetch profile immediately after login so the
      // navigate('Home') happens WITH user data ready
      await loadProfile(s.userId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await authService.signOut();
      setSession(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ session, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
