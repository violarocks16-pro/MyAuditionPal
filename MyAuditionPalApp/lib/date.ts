/**
 * Date helpers.
 *
 * We STORE dates as ISO "YYYY-MM-DD" strings (they sort correctly and are
 * timezone-safe), but DISPLAY them spelled out as "September 1, 2026".
 *
 * We parse the parts by hand instead of `new Date("2026-09-01")` because that
 * form is treated as UTC and can show the wrong day depending on timezone.
 */

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2026-09-01" -> "September 1, 2026". Returns the input unchanged if unparseable. */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return iso;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

/** A Date object -> "2026-09-01" using the device's local date. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** "2026-09-01" -> a local Date (used to seed the calendar). Falls back to today. */
export function isoToDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}
