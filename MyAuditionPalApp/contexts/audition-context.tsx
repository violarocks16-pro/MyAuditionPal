/**
 * The audition "brain" for the whole app.
 *
 * A React Context lets many screens share the same data without passing it down
 * by hand. We wrap the app in <AuditionProvider> (see app/_layout.tsx), and then
 * ANY screen can call useAuditions() to read the list or change it.
 *
 * The list lives in React state (so the UI updates instantly), and every change
 * is also written to the phone via lib/storage so it survives closing the app.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { createId } from '@/lib/id';
import { loadAuditions, saveAuditions } from '@/lib/storage';
import { Audition, AuditionStatus } from '@/types/audition';

/**
 * What the Add form provides when creating an audition: everything except the
 * fields the app fills in itself (id, timestamps). `status` is optional here —
 * if omitted, a new audition starts as 'interested'.
 */
export type NewAuditionInput = Omit<Audition, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: AuditionStatus;
};

type AuditionContextValue = {
  auditions: Audition[];
  loading: boolean; // true while the saved data is still being read on startup
  addAudition: (input: NewAuditionInput) => Audition;
  updateAudition: (id: string, changes: Partial<Audition>) => void;
  deleteAudition: (id: string) => void;
};

// Created undefined on purpose; useAuditions() below guards against misuse.
const AuditionContext = createContext<AuditionContextValue | undefined>(undefined);

export function AuditionProvider({ children }: { children: React.ReactNode }) {
  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [loading, setLoading] = useState(true);

  // Load whatever was saved, once, when the app starts.
  useEffect(() => {
    let active = true;
    loadAuditions().then((saved) => {
      if (!active) return; // ignore if the component unmounted before we finished
      setAuditions(saved);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const addAudition = useCallback((input: NewAuditionInput) => {
    const now = new Date().toISOString();
    const audition: Audition = {
      ...input,
      id: createId(),
      status: input.status ?? 'interested',
      createdAt: now,
      updatedAt: now,
    };
    setAuditions((current) => {
      const next = [audition, ...current]; // newest first
      saveAuditions(next);
      return next;
    });
    return audition;
  }, []);

  const updateAudition = useCallback((id: string, changes: Partial<Audition>) => {
    setAuditions((current) => {
      const next = current.map((a) =>
        a.id === id ? { ...a, ...changes, updatedAt: new Date().toISOString() } : a
      );
      saveAuditions(next);
      return next;
    });
  }, []);

  const deleteAudition = useCallback((id: string) => {
    setAuditions((current) => {
      const next = current.filter((a) => a.id !== id);
      saveAuditions(next);
      return next;
    });
  }, []);

  return (
    <AuditionContext.Provider
      value={{ auditions, loading, addAudition, updateAudition, deleteAudition }}>
      {children}
    </AuditionContext.Provider>
  );
}

/** The hook screens use to read and change auditions. */
export function useAuditions(): AuditionContextValue {
  const context = useContext(AuditionContext);
  if (!context) {
    throw new Error('useAuditions must be used inside an <AuditionProvider>');
  }
  return context;
}
