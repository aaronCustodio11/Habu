# Direction Approved — auth-landing redesign

**Date:** 2026-08-03
**Product:** Habu auth-landing (web/auth-landing/index.html) — Supabase email-confirm / password-reset landing

## Three directions shown (design-demos/, since removed)
- **A · Quiet Field (app mirror)** — literal port of the app's auth screens: centered column on bg-base, HabuWordmark, 800-weight title, no card, no chrome.
- **B · Raised Card (landing)** — destination-style: elevated surface-raised card (radius 24 + shadow), status in a filled circle, footer line.
- **C · Heatmap Hero (content motif)** — the 2×2 habit-heatmap becomes the live status indicator; cells fill to full on success.

All three verified: Playwright pageerror = 0, no console errors, states render correctly.

## User selection (verbatim)
First: "do it but still make it simple but with the same design pattern" → implemented Direction A.

Then overrode: "do the C demo instead after that remove unnecessary files u added earlier"

Final decision: **Direction C (Heatmap Hero)** — the 2×2 habit-heatmap is the status indicator (one cell per stage, all fill solid on success). Grayscale tokens from `constants/Colors.ts` / design doc §4.1, system fonts, 4pt spacing, radius 16, no card/chrome.

## Scope of execution
- Direction C's markup written into `web/auth-landing/index.html` (with `__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__` placeholders for the build script).
- Demo-only `?preview=` hook stripped from production page.
- Exact Supabase exchange logic (token_hash / code / implicit fragment) unchanged from the previously-working page.
- No production URL changes needed; deploy flow (build.mjs → dist/) unchanged.
- `design-demos/` directory (three demos, screenshots, screenshot.js) removed after the selection.
