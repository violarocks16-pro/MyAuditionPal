/**
 * Generates a unique id for a new audition.
 *
 * It combines the current time (Date.now, milliseconds since 1970) with a short
 * random string. Together these are unique enough for a single user's on-device
 * data — no extra library needed for v1.
 */
export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
