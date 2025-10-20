import { create } from 'zustand';
import { supabase } from '../../services/supabase/supabase';

type Role = 'teacher' | 'student';

interface User {
  id: string;
  deviceId?: string;
  email: string;
  name?: string;
  role?: Role;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: false,

  // login using Supabase Auth
  login: async (email, password) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn('Login error:', error, data);
      set({ loading: false });
      return false;
    }

    const user = data.user;
    if (!user) {
      set({ loading: false });
      return false;
    }

    // optionally fetch profile info from your test.users table
    const { data: profile } = await supabase
      .schema('test')
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log(profile);

    set({
      user: {
        id: user.id,
        email: user.email ?? '',
        name: profile?.name ?? 'Unnamed',
        role: (profile?.role as Role) ?? 'student',
        deviceId: profile?.device_id,
      },
      loading: false,
    });

    console.log(user);

    return true;
  },

  // logout and clear user
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  // restore session from AsyncStorage (Supabase handles tokens)
  restoreSession: async () => {
    set({ loading: true });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('test.users')
        .select('name, role')
        .eq('id', user.id)
        .single();

      set({
        user: {
          id: user.id,
          email: user.email ?? '',
          name: profile?.name ?? 'Unnamed',
          role: (profile?.role as Role) ?? 'student',
        },
      });
    }
    set({ loading: false });
  },
}));
