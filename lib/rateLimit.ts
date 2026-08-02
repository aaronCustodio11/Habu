/**
 * Supabase auth rate-limit helpers.
 *
 * Hosted Supabase enforces per-IP limits on auth endpoints (Auth → Rate Limits
 * in the dashboard). When a limit is hit, supabase-js rejects with an error
 * carrying HTTP 429 and a message like "Request rate limit reached".
 */

const RATE_LIMIT_STATUS = 429;

/** True when an auth error is a Supabase rate-limit response. */
export function isRateLimitError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status?: number }).status === RATE_LIMIT_STATUS;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /rate limit|too many requests/i.test(message);
}

/** Seconds to wait extracted from a Supabase 429 message, or null. */
export function parseRateLimitWait(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('message' in error)) return null;
  const message = String((error as { message?: unknown }).message ?? '');
  // Supabase messages look like "Request rate limit reached. Try again in 30.0 seconds"
  const match = message.match(/in\s+(\d+(?:\.\d+)?)\s+seconds?/i);
  return match ? Math.ceil(Number(match[1])) : null;
}
