import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: 'test',
  },
  auth: {
    storage: AsyncStorage, // This saves the session to the phone's disk
    autoRefreshToken: true, // Recommended for a smooth experience
    persistSession: true, // Keeps user logged in after app close
    detectSessionInUrl: false,
  },
});
