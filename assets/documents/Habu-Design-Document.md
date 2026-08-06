# Habu — Design Document

**Version:** 1.0
**Scope:** Visual design system, responsive layout, and platform-adaptive UI (iOS + Android)
**Companion docs:** Habu-PRD.md (product spec), Habu-TDD.md (technical implementation)

---

## 1. Design Philosophy

Habu is visually quiet everywhere except the one place it should be loud: **the user's own data.** The chrome — navigation, cards, buttons, backgrounds — stays strictly black, white, and gray across both platforms. The only color in the entire app is whatever the user picks per board, which shows up in that board's heatmap, icon, and accent touches. This isn't just an aesthetic choice — it's functional: a grayscale shell means every board's color reads clearly and consistently, with nothing competing with it.

On iOS 26+, navigation chrome and floating surfaces use Apple's native **Liquid Glass** material. On Android and older iOS versions, the same chrome renders as solid, flat black/white/gray surfaces — no fake glass, no blur hacks. The two platforms are allowed to look like themselves; the brand identity lives in the grayscale palette, typography rhythm, and the boards' colors, not in forcing one platform to imitate the other.

### 1.1 Principles

1. **Grayscale shell, colorful content.** Chrome (nav bars, cards, buttons, backgrounds, icons that aren't board-specific) is always black/white/gray. Color only ever comes from a board's user-picked color.
2. **Glass is chrome, never content.** Liquid Glass is reserved for navigation and floating controls (tab bar, headers, modals' backing surface) — never applied to primary content like the heatmap grid or board list rows. This follows Apple's own HIG guidance for Liquid Glass and keeps content legible regardless of what's behind it.
3. **Platform-native, not platform-uniform.** Typography, navigation patterns, and glass/material behavior follow each platform's own system conventions (SF Pro + Liquid Glass on iOS, Roboto + Material 3 on Android) rather than forcing pixel parity between them.
4. **One tap stays one tap.** No visual treatment (glass, animation, shadow) may add perceptible latency or extra motion to the core check-in gesture on Home.
5. **Legible in both modes, always.** Every glass/translucent surface has a guaranteed-readable fallback and respects the OS's Reduce Transparency / Reduce Motion accessibility settings.

---

## 2. Platform Strategy

### 2.1 iOS — Liquid Glass

- **Availability:** Liquid Glass (`UIVisualEffectView`-backed) is iOS 26+ only.
- **Implementation:** `expo-glass-effect` (`GlassView`, `GlassContainer`) for RN-level glass surfaces; Expo Router's native tabs for a true system Liquid Glass tab bar; `@expo/ui` where a SwiftUI-backed glass transition is needed (e.g., a modal presentation).
- **Runtime guard:** every glass surface checks `isLiquidGlassAvailable()` (and `isGlassEffectAPIAvailable()` for early iOS 26 betas) before rendering `GlassView`; devices on iOS <26 automatically render the flat fallback (§2.3) with zero visual regression — not a broken or empty state.
- **Where Liquid Glass is used:**
  - Bottom tab bar (via native tabs — automatic, no custom implementation)
  - Top navigation headers on Home, Boards, Settings
  - Floating action elements (e.g., a create-board button if it floats over content)
  - Modal backing surfaces (Check-in modal, Customize Stats modal)
- **Where it is explicitly NOT used:**
  - Board list rows / cards
  - The heatmap grid and any widget content
  - Form fields and inputs
  - Settings list rows

### 2.2 Android — Material 3

- Android renders the equivalent chrome (tab bar, headers, modal surfaces) using **Material 3** conventions — solid surfaces with Material's own elevation/tonal system, kept within the app's black/white/gray palette (i.e., Material 3's tonal elevation expressed in grayscale, not Material's default purple-leaning dynamic color).
- Expo Router's native tabs already adapt automatically to Material 3 on Android with no custom code required.
- No attempt is made to visually replicate Liquid Glass's blur/refraction on Android — Material 3's own elevation and surface conventions serve the same "chrome vs. content" separation natively.

### 2.3 Flat fallback (Android, and iOS <26)

The same layout and information hierarchy, with `GlassView` swapped for a plain `View` using a solid `surface` background token (§4) and a standard platform shadow/elevation. This is not a "degraded" experience — it's simply the other 90% of devices in the fleet, treated as first-class, not as an afterthought.

---

## 3. Responsive Layout

### 3.1 Supported device ranges

| Platform | Reference sizes |
|---|---|
| iPhone | SE (375×667) through Pro Max (430×932) |
| Android | Small (360dp width) through large (~480dp width) phones |

No tablet/iPad-specific layout in v1 (per PRD scope) — the app runs on iPad/large-screen Android in compatibility mode (scaled phone layout), not a dedicated adaptive layout.

### 3.2 Layout approach

- **Fluid, not fixed-breakpoint.** Almost all screens are single-column and scroll vertically, so most responsiveness is handled by flex layout and safe-area insets rather than distinct breakpoints.
- **One real breakpoint:** the Home quick-stats row and the widget grid (Customize Stats) switch from a 2-column to a 3-column layout at ~≥390pt width, so smaller phones (SE) get larger, more tappable widget tiles instead of cramming in a third column.
- **Safe areas:** all screens respect `SafeAreaView`/safe-area insets on both platforms — critical for the Liquid Glass tab bar and header, which sit flush with the system chrome rather than inside a manually-padded box.
- **Dynamic Type / font scaling:** all text uses relative, scalable units (not hardcoded pixel font sizes) and is tested at the largest standard accessibility text size on both platforms to confirm no truncation on the Home greeting, board names, or widget labels.

### 3.3 Spacing scale

A single 4pt-based spacing scale, used identically on both platforms:

| Token | Value |
|---|---|
| `space-xs` | 4 |
| `space-sm` | 8 |
| `space-md` | 16 |
| `space-lg` | 24 |
| `space-xl` | 32 |
| `space-2xl` | 48 |

### 3.4 Corner radius

| Token | Value | Used for |
|---|---|---|
| `radius-sm` | 8 | Chips, tags, small buttons |
| `radius-md` | 16 | Cards, board rows |
| `radius-lg` | 24 | Modals, large widget tiles |
| `radius-full` | 999 | Pills, avatar/icon circles |

Liquid Glass surfaces on iOS use Apple's own continuous-corner (squircle) radius behavior rather than these fixed tokens where `GlassView`/native tabs render it automatically; the tokens above apply to the flat fallback and to all non-glass content surfaces on both platforms.

---

## 4. Color System

### 4.1 Design tokens

Strictly grayscale. No brand color exists in the palette — the app's "color" is deliberately absent so that board colors (user-chosen, §4.3) are the only color a user ever sees.

**Light mode**

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#FFFFFF` | Screen background |
| `bg-surface` | `#F5F5F5` | Cards, rows, non-glass chrome |
| `bg-surface-raised` | `#FFFFFF` (+ shadow) | Modals, elevated cards |
| `border-subtle` | `#E0E0E0` | Card/row dividers |
| `text-primary` | `#0A0A0A` | Headlines, primary content |
| `text-secondary` | `#6B6B6B` | Metadata, timestamps, helper text |
| `text-tertiary` | `#A3A3A3` | Placeholder, disabled |
| `icon-default` | `#1A1A1A` | Non-board-specific icons |
| `overlay-scrim` | `#000000` @ 40% | Modal backdrop |

**Dark mode**

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#000000` | Screen background |
| `bg-surface` | `#161616` | Cards, rows, non-glass chrome |
| `bg-surface-raised` | `#1E1E1E` (+ elevation) | Modals, elevated cards |
| `border-subtle` | `#2A2A2A` | Card/row dividers |
| `text-primary` | `#FAFAFA` | Headlines, primary content |
| `text-secondary` | `#9A9A9A` | Metadata, timestamps, helper text |
| `text-tertiary` | `#6B6B6B` | Placeholder, disabled |
| `icon-default` | `#EDEDED` | Non-board-specific icons |
| `overlay-scrim` | `#000000` @ 60% | Modal backdrop |

**Semantic (grayscale only — no green/red)**

| Token | Light | Dark | Usage |
|---|---|---|---|
| `state-success-fg` | `#0A0A0A` on `#F5F5F5` w/ checkmark glyph | `#FAFAFA` on `#161616` w/ checkmark glyph | Completed check-in — communicated via a filled checkmark icon and filled board row state, not via color |
| `state-error-fg` | `#0A0A0A` | `#FAFAFA` | Errors are communicated via icon (⚠) + copy, not a red color, to preserve the grayscale rule |
| `state-offline-bg` | `#EDEDED` | `#1E1E1E` | Offline banner |

**Design rule:** since the palette is intentionally colorless, every state that other apps would communicate with color (success, error, offline) must be legible through **shape, icon, weight, or motion** instead — e.g., a completed board isn't "green," it's a filled row with a bold checkmark glyph and slightly heavier card weight.

### 4.2 Liquid Glass tint

On iOS, `GlassView`'s `tintColor` prop is left **unset/neutral** by default (system-adaptive glass) rather than tinted with any Habu brand color, keeping glass surfaces true to Apple's system look rather than reskinned. The one exception: a completed/active state within a glass surface (rare — glass is chrome, not content) may use a very low-opacity black/white tint consistent with `text-primary`, never a hue.

### 4.3 Board colors (the one place color lives)

- Each board has a user-selected `color` field (already in the schema — see TDD §2.1).
- **Color picker palette:** a curated set of ~12–16 swatches (not a full color wheel) so board colors stay visually distinct from each other and remain legible against both light and dark grayscale surfaces. Avoid near-white and near-black swatches, since those would disappear into the base palette.
- Board color appears in: the board's heatmap cell fill (intensity via opacity of that single hue, not a new color per intensity level), the board's icon background, and a small color dot/accent on its row in lists.
- Board color **never** appears in chrome — tab bar, headers, and buttons stay grayscale regardless of which board is currently in view.

---

## 5. Typography

Native platform type, per platform convention — no custom or monospace typeface.

| Platform | Typeface | Notes |
|---|---|---|
| iOS | SF Pro (Text/Display, system default) | Automatically supports Dynamic Type |
| Android | Roboto (Material 3 default) | Automatically supports Android font scaling |

### 5.1 Type scale (both platforms, expressed as roles, not fixed sizes)

| Role | iOS equivalent | Android/Material equivalent | Usage |
|---|---|---|---|
| Display | Large Title (34) | Display Small (36) | Onboarding headlines only |
| Title | Title 1 (28) | Headline Large (32) | Screen titles (Home greeting, Boards) |
| Heading | Title 3 (20) | Title Large (22) | Section headers, board names in detail view |
| Body | Body (17) | Body Large (16) | Primary content, list rows |
| Subtext | Subheadline (15) | Body Medium (14) | Metadata, timestamps, helper text |
| Caption | Caption 1 (12) | Label Small (11) | Widget labels, tags |

Weight: system default regular for body text, semibold/medium for headings — no custom font weights beyond what each platform's default type ramp provides.

---

## 6. Iconography

- **iOS:** SF Symbols throughout (weight-matched to type scale, supports the same Dynamic Type/accessibility scaling as text).
- **Android:** Material Symbols (outlined style by default, to match SF Symbols' visual weight rather than Material's filled default).
- All chrome icons are grayscale (`icon-default` token). Board icons (from the Create/Edit Board icon picker, per PRD §6.5) are the one icon category that renders in the board's own color.

---

## 7. Component Library

### 7.1 Navigation

- **Tab bar (Home / Boards / Settings):** iOS 26+ → native Liquid Glass tab bar via Expo Router native tabs, no custom styling needed. iOS <26 → standard translucent-blur tab bar (system default, not custom glass). Android → Material 3 navigation bar, grayscale tonal surface.
- **Header:** iOS → `GlassView`-backed large-title header, collapsing to a glass compact header on scroll (standard iOS 26 header behavior). Android → Material 3 top app bar, solid `bg-surface`, no collapse-to-glass equivalent — collapses to a standard condensed Material app bar instead.

### 7.2 Board Card / Row (Home & Boards list)

- Solid `bg-surface` card (never glass — content rule, §1.1/§2.1).
- Layout: icon (board color, left) → name + mini-heatmap strip or streak count (center) → completion state affordance (right).
- **States:**
  - Default (not yet checked in today): outline-only completion affordance.
  - Completed today: filled affordance with checkmark glyph, subtly heavier card border/weight (grayscale-only success signal, §4.1).
  - Long-press: card lifts slightly (scale 0.98 → 1.0 spring, or platform-standard long-press feedback) before the Check-in modal presents.

### 7.3 Modals (Check-in, Customize Stats)

- iOS 26+: presented over a `GlassView`-backed sheet background (chrome), with all actual form content (note field, widget list) on solid `bg-surface` cards inside it — glass never sits directly behind editable text.
- Android / iOS <26: standard Material/native sheet, solid `bg-surface-raised`.
- Both platforms: standard system sheet presentation and dismiss gesture (swipe-down / back-gesture), no custom transition.

### 7.4 Buttons

| Variant | Style |
|---|---|
| Primary | Filled `text-primary`-on-`bg-base` (i.e., black-on-white in light mode, white-on-black in dark) — the only "loud" chrome element in the whole system, reserved for the single primary action per screen (e.g., "Get Started," "Create Board") |
| Secondary | Outlined, 1px `border-subtle`, `text-primary` label |
| Destructive | Same shape as primary, but communicated via icon (⚠/trash) + explicit copy ("Delete Account") rather than a red fill, preserving the grayscale rule |
| Text/ghost | No fill/border, `text-secondary`, for tertiary actions |

### 7.5 Inputs

- Solid `bg-surface` field, `border-subtle` outline, `radius-md`. Focus state: border shifts to `text-primary` weight (1px → 1.5px), no color change.
- Error state: border + a small inline icon+copy, not a red border (grayscale rule).

### 7.6 Heatmap Grid

- SVG grid, cells filled with the board's color at varying opacity for intensity (e.g., 20/40/70/100% for light/medium/high/max completion density on weekly-target boards; binary filled/unfilled for daily boards).
- Unfilled/no-data cells use `border-subtle` as a faint outline only — no fill — so the grid reads clearly against both light and dark backgrounds without needing a separate "empty" color.
- Never rendered inside a glass surface (§2.1) — always on solid `bg-base`/`bg-surface`.

### 7.7 Widgets (dashboard tiles)

- All 5 widget types (Heatmap, Streak Counter, Weekly Bar Chart, Monthly Completion %, Best Streak Badge) render on solid `bg-surface` tiles, `radius-md`, consistent internal padding (`space-md`).
- Only the Heatmap widget and Weekly Bar Chart carry the board's color (as data-ink); Streak Counter, Monthly Completion %, and Best Streak Badge are typographic/numeric and stay fully grayscale — color is reserved for genuinely visual/graphical widgets, not for numbers.

### 7.8 Offline Banner / Sync Indicator

- Grayscale only, per §4.1 semantic tokens — offline state uses a persistent thin banner (`state-offline-bg`) with an icon + "Offline — changes will sync later," not a color change.
- Sync-in-progress: a subtle shimmer/pulse on the affected element only (e.g., the board row just checked in), not a global loading treatment.

---

## 8. Motion & Interaction

- **Check-in tap:** immediate visual response (<100ms perceived) — checkmark fills in with a quick spring, no waiting on network (consistent with the local-first architecture in the TDD).
- **Long-press → modal:** standard platform long-press timing (~500ms), modal presents with each platform's native sheet transition (no custom easing curves).
- **Liquid Glass-specific motion:** where `GlassView`/`GlassContainer` is used, rely on Apple's built-in `animate`/`animationDuration` glass-effect props for any fade in/out (per Expo's documented guidance — animating `opacity` directly on a `GlassView` breaks the glass rendering, so all glass-surface transitions must use the library's native animation props, never manual opacity tweens).
- **Reduce Motion:** when the OS-level Reduce Motion setting is on, springs/scale feedback degrade to simple opacity crossfades on both platforms.
- **Reduce Transparency (iOS):** when enabled, `GlassView` surfaces must render their solid fallback automatically — checked via the same `isLiquidGlassAvailable()`/OS accessibility state used for version gating (§2.1), not a separate code path to maintain.

---

## 9. Dark / Light Mode

- **Default:** follows system setting (`theme_preference = 'system'`), matching PRD §6.14 and TDD §7.3's `themeStore`.
- **Manual override:** available in Settings (Light / Dark / System).
- **No "auto" scheduling** (e.g., time-of-day based) in v1 — only the three states above.
- Every token in §4.1 has both a light and dark value; no screen should hardcode a color outside the token set, so a full theme switch requires no per-screen logic.
- Board colors (§4.3) are chosen against a mid-tone reference swatch so the same hue remains legible in both modes without needing separate light/dark variants per board.

---

## 10. Screen-Level Notes

Applying the system above to each module from the PRD (§6) — only calling out where a screen has a non-default treatment:

| Screen | Notes |
|---|---|
| Onboarding | Full-bleed `bg-base`, large Display-scale headline per slide, no glass (pre-auth, keep it simple/fast-loading) |
| Login/Sign-up | Solid `bg-base`, standard form inputs (§7.5), no glass |
| Home | Glass header (iOS 26+)/solid header (else); board list on solid cards; quick stats as 2–3 widget tiles (§7.7) |
| Create/Edit Board | Full-screen pushed screen (native card push on all platforms incl. iOS 26+); icon/color pickers as a grid of swatches (grayscale chrome around them, full color in the swatches themselves); content caps and centers on large screens |
| Check-in modal | Glass sheet backing (iOS 26+) with solid content card inside, per §7.3 |
| Selected Board Stats | Full heatmap (board color) + widget tiles; glass header only, all content solid |
| Boards (Active/Archived) | Segmented control in grayscale; archived rows slightly reduced opacity on `text-secondary`/`text-tertiary` to visually de-emphasize without color |
| Customize Stats | Widget picker grid (grayscale tiles + icon per widget type), reorder via up/down buttons per TDD §6.4 |
| Settings | Deliberately plain — standard grouped list, solid surfaces, no glass, no visual flourish (per PRD §6.13's explicit "boring is correct" guidance) |
| Empty states | Centered icon (grayscale) + headline + single primary button, on solid `bg-base` |

---

## 11. Accessibility

- Minimum contrast: `text-primary` on `bg-base`/`bg-surface` exceeds WCAG AA in both modes by design (near-black on white / near-white on black); `text-secondary` verified against AA for normal text size at minimum.
- All tap targets ≥44×44pt (iOS) / 48×48dp (Android).
- Dynamic Type / Android font scaling supported up to the largest standard accessibility size without truncation on Home, board rows, and widget labels (§3.2).
- `AccessibilityInfo.isReduceTransparencyEnabled()` checked alongside Liquid Glass availability (§2.1, §8) so glass gracefully steps down for users who've disabled transparency system-wide, not just for unsupported OS versions.
- Screen reader labels on every interactive element, per PRD §6 accessibility requirement — icons-only affordances (e.g., the completion checkmark) always paired with an accessible label ("Mark [board name] complete for today"), since color can't be relied on as the only status signal.

---

## 12. Implementation Reference (ties to TDD)

| Design system piece | Library / approach |
|---|---|
| iOS Liquid Glass surfaces | `expo-glass-effect` (`GlassView`, `GlassContainer`), guarded by `isLiquidGlassAvailable()` |
| iOS native tab bar | Expo Router native tabs (`unstable_settings`/native tabs API) — auto Liquid Glass on 26+, standard tab bar below |
| SwiftUI-backed glass transitions (if needed for a specific modal) | `@expo/ui` |
| Android chrome | Material 3 components via standard RN/Expo Router theming, grayscale tonal palette (§4.1) |
| Design tokens | `constants/Colors.ts` (already scaffolded per TDD file structure) — extended to hold the full token table in §4.1, light and dark variants |
| Board color swatches | New constant, e.g. `constants/BoardColors.ts`, the curated 12–16 swatch set from §4.3 |

**Build note carried over from the TDD:** `expo-glass-effect` and `@expo/ui` are not reliable in Expo Go — glass surfaces should be developed and tested on an EAS development build, consistent with the native-widget guidance already in TDD §9.2 (both land in the same "Expo Go stops being sufficient" window of the project).

---

## 13. Open Items to Revisit

1. **Board color swatch set** — the exact 12–16 hex values aren't finalized here; recommend picking them once real device testing is possible, so they can be checked for legibility against both true black and true white.
2. **Glass tint on completed/success states inside a glass surface** — flagged in §4.2 as a rare exception; worth a visual pass once the Home header is actually built, to confirm the neutral-tint default doesn't make a completed state feel invisible.
