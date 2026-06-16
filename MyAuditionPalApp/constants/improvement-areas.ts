/**
 * The fixed set of "areas to work on" a user can tag on an attended audition.
 * Kept structured (not free text) so we can count recurring themes across
 * auditions and surface patterns — no AI needed.
 */
export const IMPROVEMENT_AREAS = [
  'Intonation',
  'Rhythm',
  'Tone / Sound',
  'Dynamics',
  'Tempo',
  'Phrasing / Musicality',
  'Technique',
  'Focus',
  'Excerpts',
  'Nerves / Mindset',
  'Preparation',
  'Memory',
] as const;
