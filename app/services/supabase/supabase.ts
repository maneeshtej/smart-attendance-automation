// services/supabase.ts
import 'react-native-url-polyfill/auto'; // <— important fix for the “protocol getter” error
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Use your real values here
const SUPABASE_URL = 'https://cgqmzpeujkhlnktdgdsn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_R15V4gQ0ZzvvJrPRxSU93A_1l5QNBRk'; // new publishable key

// Create a single client instance for the app
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    fetch: (...args) => fetch(...args), // ensures React Native’s fetch is used
  },
  auth: {
    storage: AsyncStorage, // persist session on device
    persistSession: true,
    autoRefreshToken: true,
  },
});
