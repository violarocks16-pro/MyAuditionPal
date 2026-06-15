/**
 * The Supabase client — our connection to the cloud database and auth.
 *
 * The URL and publishable key below are safe to ship in the app: the publishable
 * key is designed for client use, and the database is protected by Row-Level
 * Security policies.
 */

import 'react-native-url-polyfill/auto'; // Supabase needs the URL API in React Native

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const SUPABASE_URL = 'https://odhmkfqkzzlekddxdwrc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2QK_7b7Vx11iS1jPqlPodA_p4bZnwai';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Store the signed-in session on the device so it survives app restarts.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // we're not in a browser
  },
});

// Keep the login token fresh while the app is open; pause refresh in the background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
