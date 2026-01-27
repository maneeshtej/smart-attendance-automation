import { supabase } from '../lib/supabase';
import { UserData } from '../types/user';

export type AuthSession = {
  userId: string;
  email: string;
};

/**
 * Signs in a user with email and password.
 * Note: Without persistence, this session is lost on app reload.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthSession> {
  console.log('Starting sign in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  console.log('Sign in call finished!');

  if (error) {
    // Log the technical error to a service like Sentry or LogRocket here
    console.error('Auth Service Error:', error.message);

    // Throw a cleaner message or custom Error object
    throw new Error(error.message);
  }

  return {
    userId: data.user.id,
    email: data.user.email!,
  };
}

/**
 * NEW: Signs up a new user.
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Listens for auth changes.
 * Essential for reacting to logins/logouts in real-time.
 */
export function onAuthStateChange(
  callback: (session: AuthSession | null) => void,
) {
  // Destructure to get the subscription object directly
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) {
      callback(null);
    } else {
      callback({
        userId: session.user.id,
        email: session.user.email!,
      });
    }
  });

  return subscription; // Return the actual subscription object
}

/**
 * Gets current session from memory.
 */
export async function getInitialSession(): Promise<AuthSession | null> {
  // getSession() is instant (reads from AsyncStorage)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) return null;

  return {
    userId: session.user.id,
    email: session.user.email!,
  };
}

/**
 * NEW: Get the current user's full metadata/profile.
 * Useful for Smart Attendance to get student names/IDs.
 */
export async function getCurrentUserProfile() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Fetches the extended profile from the 'test.users' table
 */
/**
 * Fetches and flattens the extended profile from 'test.users' and 'test.profiles'
 */
export async function getUserProfile(userId: string): Promise<UserData> {
  const { data, error } = await (supabase as any)
    .schema('test')
    .from('users')
    .select(
      `
      id, 
      name, 
      role,
      profiles (
        email,
        phone_no,
        description,
        avatar_url
      )
    `,
    )
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`DATABASE_ERROR: ${error.message}`);
  }

  if (!data) {
    throw new Error('PROFILE_NOT_FOUND');
  }

  // INDUSTRIAL FLATTENING:
  // We take the nested 'profiles' object and spread it into the top level
  const profile = data.profiles; // Since it's a 1:1 relationship via maybeSingle

  return {
    id: data.id,
    name: data.name,
    role: data.role as any,
    email: profile?.email || '',
    phone_no: profile?.phone_no || null,
    description: profile?.description || null,
    avatar_url: profile?.avatar_url || null,
  };
}
