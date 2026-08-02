# Direction Approved — Habu Auth Screens

**Date:** 2026-08-02
**Project:** Habu (Expo SDK 54, React Native)
**Task:** Redesign login / signup / forgot-password / reset-password UI, responsive iOS + Android, add Apple & Google sign-in buttons (UI only — backend later).

## Gate record

Three visual directions were produced as real mockups and shown to the user; the approved reference is kept, the others were removed.

| Direction | File | Approach |
|---|---|---|
| 1 · Quiet Field | `design-demos/d1-quiet-field.html` | Classic email-first, centered, calm |

**User's choice (verbatim):** `use d1`

**Chosen:** Direction 1 — **Quiet Field**. Email-first hierarchy, centered column, divider before social buttons, underlined helper links. Sign-up becomes its own separate route (`/signup`). Apple/Google buttons are UI-only placeholders (backend wiring deferred).

## Constraints honored

- Strictly grayscale per Habu design doc §4.1 / §7.4 / §7.5 / §10 (no color, no glass on pre-auth screens).
- Brand wordmark: 2×2 heatmap mini-grid (product's core motif), used for the first time as the auth identity mark.
- Apple/Google buttons: monochrome glyphs (Ionicons `logo-apple` / `logo-google`) tinted to `text-primary` — Apple's official button is monochrome; Google kept consistent with the grayscale rule.
- Backend untouched: Apple/Google buttons show a "coming soon" notice on press.
