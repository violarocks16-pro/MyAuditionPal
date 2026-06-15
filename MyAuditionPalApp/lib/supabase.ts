/**
 * The Supabase client — our connection to the cloud database.
 *
 * The URL and publishable key below are safe to ship in the app: the publishable
 * key is designed for client use, and the database is protected by Row-Level
 * Security policies (the `listings` table only allows reading).
 */

import 'react-native-url-polyfill/auto'; // Supabase needs the URL API in React Native

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://odhmkfqkzzlekddxdwrc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_2QK_7b7Vx11iS1jPqlPodA_p4bZnwai';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // No user sign-in yet — we're only reading public listings.
    persistSession: false,
  },
});
