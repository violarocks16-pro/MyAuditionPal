/**
 * An audition *listing* — a posting you can discover and "heart" into your own
 * tracked auditions. For now these come from a small curated seed list; later
 * they'll be served from Supabase (and eventually aggregated automatically).
 */
export interface Listing {
  id: string;
  ensemble: string;
  position: string;
  instrument: string; // which instrument this posting is for (used to filter)
  location?: string;
  applicationDeadline?: string; // ISO "YYYY-MM-DD"
  auditionDate?: string; // ISO "YYYY-MM-DD"
  pay?: string; // e.g. "Per-service" or "$1,200/week"
  url?: string; // link to the original posting
  notes?: string; // any extra detail
}
