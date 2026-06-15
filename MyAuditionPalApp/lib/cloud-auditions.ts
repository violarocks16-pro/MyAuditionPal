/**
 * Reads and writes the signed-in user's auditions in Supabase.
 *
 * The database uses snake_case columns; we map to/from our camelCase `Audition`
 * type here. Row-Level Security guarantees a user only ever touches their own rows,
 * but we also stamp `user_id` on every write.
 */

import { supabase } from '@/lib/supabase';
import { Audition, AuditionStatus } from '@/types/audition';

type Row = {
  id: string;
  user_id: string;
  ensemble: string;
  position: string;
  location: string | null;
  status: string;
  result: string | null;
  application_deadline: string | null;
  audition_date: string | null;
  repertoire: string | null;
  repertoire_photo_uri: string | null;
  notes: string | null;
  reminder_notification_id: string | null;
  attend_nudge_dismissed: boolean | null;
  source_listing_id: string | null;
  created_at: string;
  updated_at: string;
};

function toRow(userId: string, a: Audition): Row {
  return {
    id: a.id,
    user_id: userId,
    ensemble: a.ensemble,
    position: a.position,
    location: a.location ?? null,
    status: a.status,
    result: a.result ?? null,
    application_deadline: a.applicationDeadline ?? null,
    audition_date: a.auditionDate ?? null,
    repertoire: a.repertoire ?? null,
    repertoire_photo_uri: a.repertoirePhotoUri ?? null,
    notes: a.notes ?? null,
    reminder_notification_id: a.reminderNotificationId ?? null,
    attend_nudge_dismissed: a.attendNudgeDismissed ?? null,
    source_listing_id: a.sourceListingId ?? null,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function fromRow(r: Row): Audition {
  return {
    id: r.id,
    ensemble: r.ensemble,
    position: r.position,
    location: r.location ?? undefined,
    status: r.status as AuditionStatus,
    result: r.result ?? undefined,
    applicationDeadline: r.application_deadline ?? undefined,
    auditionDate: r.audition_date ?? undefined,
    repertoire: r.repertoire ?? undefined,
    repertoirePhotoUri: r.repertoire_photo_uri ?? undefined,
    notes: r.notes ?? undefined,
    reminderNotificationId: r.reminder_notification_id ?? undefined,
    attendNudgeDismissed: r.attend_nudge_dismissed ?? undefined,
    sourceListingId: r.source_listing_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** All of the user's auditions, newest first. */
export async function fetchCloudAuditions(userId: string): Promise<Audition[]> {
  const { data, error } = await supabase
    .from('auditions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('Could not load cloud auditions:', error.message);
    return [];
  }
  return (data ?? []).map(fromRow);
}

/** Insert or update one audition (upsert keyed on id). */
export async function upsertCloudAudition(userId: string, audition: Audition): Promise<void> {
  const { error } = await supabase.from('auditions').upsert(toRow(userId, audition));
  if (error) console.warn('Could not save audition to cloud:', error.message);
}

/**
 * Upsert many at once — used to migrate local (guest) auditions on first sign-in.
 * Returns true only if the write succeeded, so the caller knows it's safe to
 * clear the local copy afterward.
 */
export async function upsertManyCloudAuditions(
  userId: string,
  list: Audition[]
): Promise<boolean> {
  if (list.length === 0) return true;
  const { error } = await supabase.from('auditions').upsert(list.map((a) => toRow(userId, a)));
  if (error) {
    console.warn('Could not migrate auditions to cloud:', error.message);
    return false;
  }
  return true;
}

export async function deleteCloudAudition(id: string): Promise<void> {
  const { error } = await supabase.from('auditions').delete().eq('id', id);
  if (error) console.warn('Could not delete cloud audition:', error.message);
}
