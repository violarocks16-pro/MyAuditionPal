/**
 * The audition "brain" for the whole app — now cloud-aware.
 *
 * - Guest (not signed in): auditions live on the device (AsyncStorage), as before.
 * - Signed in: auditions live in the user's Supabase account and sync across devices.
 * - On first sign-in, any local guest auditions are migrated up to the account,
 *   then the local copy is cleared.
 *
 * Deadline reminders are scheduled on the device in both modes.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import {
  deleteCloudAudition,
  fetchCloudAuditions,
  upsertCloudAudition,
  upsertManyCloudAuditions,
} from '@/lib/cloud-auditions';
import { createId } from '@/lib/id';
import {
  cancelReminder,
  configureNotifications,
  scheduleDeadlineReminder,
} from '@/lib/notifications';
import { clearAuditions, loadAuditions, saveAuditions } from '@/lib/storage';
import { Audition, AuditionStatus } from '@/types/audition';

export type NewAuditionInput = Omit<
  Audition,
  'id' | 'createdAt' | 'updatedAt' | 'status' | 'reminderNotificationId'
> & {
  status?: AuditionStatus;
};

type AuditionContextValue = {
  auditions: Audition[];
  loading: boolean;
  addAudition: (input: NewAuditionInput) => Audition;
  updateAudition: (id: string, changes: Partial<Audition>) => void;
  deleteAudition: (id: string) => void;
};

const AuditionContext = createContext<AuditionContextValue | undefined>(undefined);

export function AuditionProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;

  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up notifications once.
  useEffect(() => {
    configureNotifications();
  }, []);

  // Load from the right source whenever the signed-in user changes.
  useEffect(() => {
    if (authLoading) return; // wait until we know who's signed in
    let active = true;
    setLoading(true);

    (async () => {
      if (userId) {
        // Migrate any guest auditions into the account — but only clear the local
        // copy if the cloud save actually succeeded (never lose data on failure).
        const local = await loadAuditions();
        if (local.length > 0) {
          const migrated = await upsertManyCloudAuditions(userId, local);
          if (migrated) await clearAuditions();
        }
        const cloud = await fetchCloudAuditions(userId);
        if (active) setAuditions(cloud);
      } else {
        const local = await loadAuditions();
        if (active) setAuditions(local);
      }
      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [authLoading, userId]);

  // Save a single record to the right place (cloud if signed in).
  function persistOne(record: Audition) {
    if (userId) upsertCloudAudition(userId, record);
  }
  // For guests, the whole list is persisted locally on every change.
  function persistLocal(next: Audition[]) {
    if (!userId) saveAuditions(next);
  }

  function addAudition(input: NewAuditionInput): Audition {
    const now = new Date().toISOString();
    const audition: Audition = {
      ...input,
      id: createId(),
      status: input.status ?? 'interested',
      createdAt: now,
      updatedAt: now,
    };

    setAuditions((current) => {
      const next = [audition, ...current];
      persistLocal(next);
      return next;
    });
    persistOne(audition);

    // Schedule a deadline reminder, then store its id.
    scheduleDeadlineReminder(audition).then((notificationId) => {
      if (!notificationId) return;
      const withReminder = { ...audition, reminderNotificationId: notificationId };
      setAuditions((current) => {
        const next = current.map((a) => (a.id === audition.id ? withReminder : a));
        persistLocal(next);
        return next;
      });
      persistOne(withReminder);
    });

    return audition;
  }

  function updateAudition(id: string, changes: Partial<Audition>) {
    setAuditions((current) => {
      const existing = current.find((a) => a.id === id);
      if (!existing) return current;

      const updated: Audition = { ...existing, ...changes, updatedAt: new Date().toISOString() };
      const next = current.map((a) => (a.id === id ? updated : a));
      persistLocal(next);
      persistOne(updated);

      // Reconcile the deadline reminder (cancel old, schedule fresh).
      cancelReminder(existing.reminderNotificationId);
      scheduleDeadlineReminder(updated).then((notificationId) => {
        const reconciled = { ...updated, reminderNotificationId: notificationId ?? undefined };
        setAuditions((cur) => {
          const n = cur.map((a) => (a.id === id ? reconciled : a));
          persistLocal(n);
          return n;
        });
        persistOne(reconciled);
      });

      return next;
    });
  }

  function deleteAudition(id: string) {
    setAuditions((current) => {
      const target = current.find((a) => a.id === id);
      cancelReminder(target?.reminderNotificationId);
      const next = current.filter((a) => a.id !== id);
      persistLocal(next);
      return next;
    });
    if (userId) deleteCloudAudition(id);
  }

  return (
    <AuditionContext.Provider
      value={{ auditions, loading, addAudition, updateAudition, deleteAudition }}>
      {children}
    </AuditionContext.Provider>
  );
}

export function useAuditions(): AuditionContextValue {
  const context = useContext(AuditionContext);
  if (!context) {
    throw new Error('useAuditions must be used inside an <AuditionProvider>');
  }
  return context;
}
