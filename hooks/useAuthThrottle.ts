import { useCallback, useEffect, useRef, useState } from 'react';
import { isRateLimitError, parseRateLimitWait } from '@/lib/rateLimit';

interface UseAuthThrottleOptions {
  /** Failed attempts before the client locks the button. */
  maxAttempts?: number;
  /** Cooldown duration after hitting max attempts. */
  cooldownSeconds?: number;
}

interface UseAuthThrottle {
  /** True while the button should be locked. */
  locked: boolean;
  /** Whole seconds remaining in the cooldown. */
  remainingSeconds: number;
  /** Call on a failed attempt (bad password, rejected signup, …). */
  registerFailure: () => void;
  /** Feed a caught error; auto-applies the Supabase 429 wait when relevant. */
  handleError: (error: unknown) => void;
  /** Call after a successful auth. Clears the attempt counter. */
  registerSuccess: () => void;
}

/**
 * Client-side cooldown for auth actions (login / signup). Counts failed
 * attempts; past `maxAttempts` the button locks for `cooldownSeconds`. A
 * Supabase rate-limit (429) response locks immediately for the server-told
 * duration, since the IP-level limit is out of the app's control.
 */
export function useAuthThrottle({
  maxAttempts = 5,
  cooldownSeconds = 30,
}: UseAuthThrottleOptions = {}): UseAuthThrottle {
  const [failures, setFailures] = useState(0);
  const [locked, setLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const lock = useCallback(
    (seconds: number) => {
      setLocked(true);
      setRemainingSeconds(Math.max(1, Math.round(seconds)));
      clearTimer();
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearTimer();
            setLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [],
  );

  useEffect(() => clearTimer, []);

  const registerFailure = useCallback(() => {
    setFailures((prev) => {
      const next = prev + 1;
      if (next >= maxAttempts) {
        setFailures(0);
        lock(cooldownSeconds);
      }
      return next;
    });
  }, [cooldownSeconds, lock, maxAttempts]);

  const handleError = useCallback(
    (error: unknown) => {
      if (isRateLimitError(error)) {
        lock(parseRateLimitWait(error) ?? cooldownSeconds);
        return;
      }
      registerFailure();
    },
    [cooldownSeconds, lock, registerFailure],
  );

  const registerSuccess = useCallback(() => {
    setFailures(0);
    clearTimer();
    setLocked(false);
    setRemainingSeconds(0);
  }, []);

  return { locked, remainingSeconds, registerFailure, handleError, registerSuccess };
}
