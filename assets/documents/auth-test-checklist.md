# Habu — Auth & Rate-Limiting Test Checklist

Run these after the auth/rate-limit work. Covers client validation, client-side throttle,
Supabase rate limits, and RLS.

## Pre-flight (5 min)

- [ ] `npm run typecheck` → **no errors**
- [ ] `npx expo start` → app loads in Expo Go
- [ ] **Email rate limit may be drained** (Supabase built-in: 2 emails/hour project-wide).
      If signups fail with "email rate limit exceeded": wait for the hour window to reset,
      or temporarily disable email confirmation (Dashboard → Authentication → Providers →
      Email → uncheck "Confirm email"). Re-enable before shipping.

## Section A — Signup wizard

| # | Test | Steps | Expected |
|---|------|-------|----------|
| A1 | Valid email → step 2 | Enter `you@example.com` → Continue | Advances to "Create a password"; step 1 node shows check; back button appears top-left |
| A2 | Invalid email | Enter `abc` or `name@` → Continue | Red error box "That email doesn't look right" + haptic; stays on step 1 |
| A3 | Empty email | Clear → Continue | Red box "Enter your email."; no advance |
| A4 | Back button | On step 1 → tap back | Returns to step 1, email preserved |
| A5 | Weak password | Enter `password1` → Continue | Red box "That password is too common…"; no advance |
| A6 | Short password | Enter `Pass1!a` (7 chars) → Continue | Red box "at least 8 characters" |
| A7 | Mismatch | `Test1234!` / `Test1234?` → Continue | Red box "Passwords do not match." |
| A8 | Strength meter | Type `abcd`, `Abcd1234`, `Abcdef12!`, `Abcdefghijk!2345` | Meter shows Weak / Fair / Good / Strong respectively (4 red→green segments) |
| A9 | Valid username | `habu_user` → hold Create Account 1.1s | Fill completes, success haptic, account created |
| A10 | Early release | Hold, release before 1.1s | Fill resets, nothing submitted |
| A11 | Invalid username ×5 | Enter `a` (1 char) → hold 5× | 5th attempt → button locks, label "Try again in 30s", hint "Too many attempts" |
| A12 | Post-signup | Valid full flow | Email confirm on: message "Account created — check your email to confirm, then sign in." Off: navigates to home |

## Section B — Login

| # | Test | Steps | Expected |
|---|------|-------|----------|
| B1 | Empty fields | Tap Sign In | Red box "Enter your email and password." + haptic |
| B2 | Bad email | `notanemail` → Sign In | Red box "That email doesn't look right" |
| B3 | Wrong password | Confirmed account + wrong password | Red box "Invalid login credentials" + haptic |
| B4 | Correct login | Confirmed account + right password | Navigates to home; attempt counter reset |
| B5 | Forgot password | Tap "Forgot password?" | Navigates to forgot-password screen |

## Section C — Rate limiting (the core)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| C1 | 5-fail lockout | Wrong password ×5 quickly | After 5th: button disabled, "Try again in 30s", countdown ticks down 1/s |
| C2 | Countdown ends | Wait until 0 | Button re-enables, label back to "Sign In" |
| C3 | Non-counting errors | Empty/bad email 5× | No lockout — only real server-rejected attempts count |
| C4 | Server 429 fast-path | Close app → run curl drain loop (below) → open app → 1 wrong login | Locks after 1 attempt showing server-reported seconds, not 30 |
| C5 | Success resets | Trigger C1 lockout → wait → login correctly | Counter cleared; next 4 wrong attempts don't lock |

C4 drain loop (run with the app closed):

```powershell
$u = (Get-Content .env | Where-Object { $_ -match '^EXPO_PUBLIC_SUPABASE_URL=' }) -replace '.*=',''
$k = (Get-Content .env | Where-Object { $_ -match '^EXPO_PUBLIC_SUPABASE_ANON_KEY=' }) -replace '.*=',''
1..40 | ForEach-Object { curl.exe -s -o NUL -w "%{http_code}`n" -X POST "$u/auth/v1/token?grant_type=password" -H "apikey: $k" -H "Content-Type: application/json" -d '{"email":"rate-test@habu.local","password":"x"}' } | Group-Object
```

Expected: last few iterations return `429` (bucket drained).

## Section D — RLS (needs a confirmed account, or email-confirm off)

| # | Test | Steps | Expected |
|---|------|-------|----------|
| D1 | Signed-in write | Log in → create a board | Succeeds, board appears |
| D2 | Persistence | Reload app | Board still there |
| D3 | Anon isolation | Signed-out curl GET boards | `404` |
| D4 | Cross-user isolation | Account 2 logs in | Cannot see Account 1's boards |

Anon GET check:

```powershell
foreach ($t in 'boards','completions','widget_configs') { curl.exe -s -o NUL -w "GET /rest/v1/$t -> %{http_code}`n" "$u/rest/v1/$t?select=id&limit=1" -H "apikey: $k" -H "Authorization: Bearer $k" }
```

Note: if D1 errors with PostgREST `404` / "could not find table", the `authenticated`
role lacks table grants → add `grant select, insert, update, delete on all tables in
schema public to authenticated;` to `supabase/schema.sql` and re-run in the SQL editor.

## Section E — Dashboard + cleanup

- [ ] Delete throwaway test user `rls-check-90854@gmail.com` (Authentication → Users)
- [ ] Optionally set stricter signup limit under Auth → Rate Limits (OTP/signup bucket)
- [ ] If email confirmation was disabled for testing, re-enable it

## Reference

- Client validation: `lib/security.ts`
- Client throttle: `hooks/useAuthThrottle.ts`, `lib/rateLimit.ts`
- Throttled screens: `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`
- Schema/RLS: `supabase/schema.sql`
