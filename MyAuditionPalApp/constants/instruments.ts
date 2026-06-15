/**
 * The classical instruments a user can pick. Kept in one place so the Profile
 * screen (and later, the discovery filter) all draw from the same list.
 */
export const INSTRUMENTS = [
  'Violin',
  'Viola',
  'Cello',
  'Double Bass',
  'Harp',
  'Flute',
  'Piccolo',
  'Oboe',
  'English Horn',
  'Clarinet',
  'Bass Clarinet',
  'Bassoon',
  'Contrabassoon',
  'Saxophone',
  'French Horn',
  'Trumpet',
  'Trombone',
  'Bass Trombone',
  'Tuba',
  'Timpani',
  'Percussion',
  'Piano',
  'Organ',
  'Voice',
] as const;

/** A single instrument value, e.g. 'Cello'. */
export type Instrument = (typeof INSTRUMENTS)[number];
