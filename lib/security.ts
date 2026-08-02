/**
 * Client-side auth validation & password policy.
 *
 * These constraints run on-device before anything reaches Supabase. They are a
 * usability gate, not the whole security model — server-side rules (RLS,
 * session handling) are handled separately by the Supabase project.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;
export const EMAIL_MAX_LENGTH = 254;

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwerty123',
  'letmein',
  'admin',
  'admin123',
  'welcome',
  'welcome1',
  'monkey',
  'dragon',
  'abc123',
  'abc12345',
  'iloveyou',
  'football',
  'baseball',
  'sunshine',
  'princess',
  'starwars',
  'trustno1',
  'whatever',
  'hello',
  'hello123',
  'test',
  'test123',
  'superman',
  'batman',
  'pokemon',
  'naruto',
  'master',
  'changeme',
  'letmein123',
]);

export interface PasswordChecks {
  minLength: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  symbol: boolean;
  notCommon: boolean;
}

export type PasswordScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrength {
  score: PasswordScore;
  label: string;
  checks: PasswordChecks;
}

const SCORE_LABELS: Record<PasswordScore, string> = {
  0: 'Weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
};

/** Realtime strength estimate. Empty/short passwords score 0; common ones cap low. */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
    notCommon: !COMMON_PASSWORDS.has(password.toLowerCase()),
  };

  if (password.length === 0) {
    return { score: 0, label: SCORE_LABELS[0], checks };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { score: 0, label: 'Too short', checks };
  }

  const allSameChar = /^(.)\1+$/.test(password);

  // Points from length: 8–11 → 1, 12–15 → 2, 16+ → 3
  const lengthPoints = password.length >= 16 ? 3 : password.length >= 12 ? 2 : 1;
  // Points from the displayed criteria: both cases → 1, special characters → 1
  const bothCases = checks.uppercase && checks.lowercase;
  const criteriaPoints = Number(bothCases) + Number(checks.symbol);
  const total = lengthPoints + criteriaPoints;

  let score: PasswordScore;
  if (total <= 2) score = 1; // Weak
  else if (total === 3) score = 2; // Fair
  else if (total === 4) score = 3; // Good
  else score = 4; // Strong

  if (!checks.notCommon || allSameChar) {
    score = Math.min(score, 1) as PasswordScore;
  }
  return { score, label: SCORE_LABELS[score], checks };
}

/** Submission gate — returns an error message, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (!password) return 'Choose a password.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`;
  }
  const strength = evaluatePasswordStrength(password);
  if (strength.score < 2) {
    if (!strength.checks.notCommon) {
      return 'That password is too common. Pick something more unique.';
    }
    return 'Use a mix of upper & lower case and special characters.';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (!value) return 'Enter your email.';
  if (value.length > EMAIL_MAX_LENGTH) return 'That email is too long.';
  // HTML5 spec regex: covers all legitimate providers (Gmail, Yahoo, Outlook,
  // plus-addressing like name+tag@…, subdomains like foo@mail.company.com, any TLD).
  const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!EMAIL_REGEX.test(value)) return 'That email doesn\u2019t look right.';
  return null;
}

export function validateUsername(username: string): string | null {
  const value = username.trim();
  if (!value) return 'Tell us what to call you.';
  if (value.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters.`;
  }
  if (value.length > USERNAME_MAX_LENGTH) {
    return `Username must be at most ${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) {
    return 'Use only letters, numbers, underscores, dots or dashes.';
  }
  return null;
}
