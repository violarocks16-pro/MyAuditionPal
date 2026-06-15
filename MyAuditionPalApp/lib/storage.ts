/**
 * Low-level on-device storage for auditions.
 *
 * We use AsyncStorage — a simple key/value store built into the phone. It only
 * stores strings, so we convert our auditions array to JSON text when saving
 * and parse it back into objects when loading.
 *
 * This is the ONLY file that talks to AsyncStorage directly. Everything else in
 * the app goes through the audition context, which uses these two functions.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Audition } from '@/types/audition';
import { Profile } from '@/types/profile';

// The "drawer labels" under which our data lives on the device.
const STORAGE_KEY = 'myauditionpal:auditions';
const PROFILE_KEY = 'myauditionpal:profile';

/** Load all saved auditions. Returns an empty array if there's nothing yet. */
export async function loadAuditions(): Promise<Audition[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Audition[]) : [];
  } catch (error) {
    console.warn('Could not load auditions from storage:', error);
    return [];
  }
}

/** Save the full list of auditions, replacing whatever was stored before. */
export async function saveAuditions(auditions: Audition[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(auditions));
  } catch (error) {
    console.warn('Could not save auditions to storage:', error);
  }
}

/** Load the saved profile. Returns an empty profile if there's nothing yet. */
export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Profile) : {};
  } catch (error) {
    console.warn('Could not load profile from storage:', error);
    return {};
  }
}

/** Save the profile, replacing whatever was stored before. */
export async function saveProfile(profile: Profile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn('Could not save profile to storage:', error);
  }
}
