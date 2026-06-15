/**
 * The user's profile, shared across the app (mirrors the audition context).
 *
 * Holds the chosen instrument in memory so any screen can read it, and saves
 * every change to the phone so it persists between launches.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { loadProfile, saveProfile } from '@/lib/storage';
import { Profile } from '@/types/profile';

type ProfileContextValue = {
  profile: Profile;
  loading: boolean; // true while the saved profile is still being read on startup
  setInstrument: (instrument: string) => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadProfile().then((saved) => {
      if (!active) return;
      setProfile(saved);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const setInstrument = useCallback((instrument: string) => {
    setProfile((current) => {
      const next = { ...current, instrument };
      saveProfile(next);
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, setInstrument }}>
      {children}
    </ProfileContext.Provider>
  );
}

/** The hook screens use to read and change the profile. */
export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used inside a <ProfileProvider>');
  }
  return context;
}
