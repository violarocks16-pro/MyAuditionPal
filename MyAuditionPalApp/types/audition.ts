/**
 * The Audition data model — the single record at the heart of MyAuditionPal.
 *
 * One audition record moves through a lifecycle over time via its `status` field.
 * "Active tracking" = everything before the result. "History" = the result stage.
 * Same data, two lenses — so we only model it once.
 */

/** The stages an audition moves through, in order. */
export type AuditionStatus =
  | 'interested' // hearted / saved, not applied yet
  | 'applied' // application submitted
  | 'attended'; // you went and played — see `result` for how it went

/**
 * A single audition. Dates are stored as ISO strings (e.g. "2026-09-01")
 * rather than Date objects, because we save these to the phone as JSON,
 * and JSON can't store Date objects — strings convert back and forth cleanly.
 * Fields marked optional (`?`) can be filled in later as things progress.
 */
export interface Audition {
  id: string; // unique id we generate when the record is created
  ensemble: string; // e.g. "Boston Symphony Orchestra"
  position: string; // e.g. "Section Cello"
  location?: string; // city / venue
  status: AuditionStatus; // where it is in the lifecycle
  result?: string; // free text outcome once attended, e.g. "semi-finals"
  applicationDeadline?: string; // ISO date — when applications are due
  auditionDate?: string; // ISO date — when the audition happens
  repertoire?: string; // typed list of pieces
  repertoirePhotoUri?: string; // saved photo of the rep list (instead of typing it all)
  notes?: string; // private notes
  createdAt: string; // ISO timestamp — when the record was made
  updatedAt: string; // ISO timestamp — last time it changed
}

/** Lifecycle order — handy for showing progress and finding the "next" stage. */
export const STATUS_ORDER: AuditionStatus[] = ['interested', 'applied', 'attended'];

/** Friendly labels for the UI (so we never show the raw lowercase values). */
export const STATUS_LABELS: Record<AuditionStatus, string> = {
  interested: 'Interested',
  applied: 'Applied',
  attended: 'Attended',
};

/** True while the audition is still in progress (everything before 'attended'). */
export function isActive(audition: Audition): boolean {
  return audition.status !== 'attended';
}
