/**
 * Reads audition listings from Supabase.
 *
 * The database uses snake_case column names (Postgres convention), so we map
 * them to our camelCase `Listing` type here — the rest of the app stays clean.
 */

import { supabase } from '@/lib/supabase';
import { Listing } from '@/types/listing';

type ListingRow = {
  id: string;
  ensemble: string;
  position: string;
  instrument: string;
  location: string | null;
  application_deadline: string | null;
  audition_date: string | null;
  pay: string | null;
  url: string | null;
  notes: string | null;
};

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    ensemble: row.ensemble,
    position: row.position,
    instrument: row.instrument,
    location: row.location ?? undefined,
    applicationDeadline: row.application_deadline ?? undefined,
    auditionDate: row.audition_date ?? undefined,
    pay: row.pay ?? undefined,
    url: row.url ?? undefined,
    notes: row.notes ?? undefined,
  };
}

/** Fetch listings, optionally filtered to a single instrument, soonest deadline first. */
export async function fetchListings(instrument?: string): Promise<Listing[]> {
  let query = supabase
    .from('listings')
    .select('*')
    .order('application_deadline', { ascending: true });

  if (instrument) {
    query = query.eq('instrument', instrument);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToListing);
}
