# Suwayomi WebUI: Mihon look with Material 3 Expressive

The design spec for branch `mihon-m3`. Goal: on a phone (the owner
reads on an iPhone, in Safari and as a Home Screen web app) the WebUI looks and feels like the current
Mihon Android app, polished with Material 3 Expressive (M3E). Desktop keeps working.

Rule of thumb when Mihon and M3E disagree: **Mihon's look wins**. M3E supplies polish: springs, shape
morphs, wavy progress, connected button groups, full-round pills.

Contents

1. Sources and units
2. Rules for every agent
3. Color tokens
4. Typography
5. Shape
6. Elevation
7. Motion
8. States and alphas
9. MUI integration (theme, palette, overrides)
10. Components
11. App shell, top app bar, navigation
12. iOS and PWA
13. Screens (one section each)
14. Work split, ownership, contracts
15. Testing
16. Requests and open decisions

---

## 1. Sources and units

- **Mihon source:** `github.com/mihonapp/mihon` at `d001e6f` (2026-10-21), e.g. a shallow clone
  (`git clone --depth 1 https://github.com/mihonapp/mihon`).
  Path shorthands used below:
    - `P/` = `app/src/main/java/eu/kanade/presentation/`
    - `U/` = `app/src/main/java/eu/kanade/tachiyomi/ui/`
    - `C/` = `presentation-core/src/main/java/tachiyomi/presentation/core/`
- Mihon runs `MaterialExpressiveTheme` (Compose material3 ~1.5) with its own color schemes, the
  default M3 typography and shapes, and the expressive motion scheme.
- **Units:** 1 dp = 1 CSS px, 1 sp = 1 CSS px. Write sizes as px in `sx`/`styled`; font sizes via
  `theme.typography.pxToRem` so they scale with the root size.
- **Reference phone:** iPhone 15 Pro, 393 × 852 CSS px, DPR 3. As a Home Screen app (standalone) the
  safe-area insets are top 59 px and bottom 34 px; in Safari portrait they are 0. Playwright emulation
  reports 0 insets, so tests measure bars without insets.
- **Baseline (before this redesign)**, from WebKit screenshots of the release WebUI:
    - 56 px app bar with an h5 title; UPPERCASE tabs and buttons.
    - Cards with 8 px gutters for every list row (Mihon is flat).
    - Vertical page slider on the right in the reader; 3-icon reader bottom bar.
    - Blue `#5b74ef` default theme; the owner uses pure-black dark mode and dynamic cover colors.

## 2. Rules for every agent

Hard rules (from the owner; non-negotiable):

- **Don't touch the live server.** No changes to the server, its settings or its deployment. No
  GraphQL mutations that change data: no marking read, deleting, downloading, changing settings or
  meta, installing extensions. Tests browse read-only. Never print passwords.
- Tests **always** call the test kit's `guard(page)` right after `open()`, before `login()` or any
  `goto` (it aborts GraphQL mutations).
- Don't `git commit`; the Integrate phase commits. Don't run `pnpm install` or add dependencies
  unless your brief says so (see section 16).
- Don't run `pnpm run build` (it writes `build/` while others work) and don't start vite or `pnpm dev`:
  a shared Vite dev server on port 3100, proxying the Suwayomi server on port 4567, hot-reloads the
  working tree. Don't stop it.
- Checks: `pnpm run tsc` (tsgo) and `pnpm run lint` (oxlint) must pass with no new warnings.
- Take the official route: if a tool or permission is missing, stop and say so in the result. No
  `--force`, no `NODE_PATH` hacks, no wrappers.
- Every implementation loop ends with an independent review (fresh subagent or `/code-review`) of
  clean code, architecture and these standards, followed by a fix pass.

Code standards (upstream `CONTRIBUTING.md` plus existing patterns):

- Imports
    - No relative imports; use `@/…`.
    - Respect `.oxlintrc.jsonc`: `@mui/*` only via `@mui/material/<X>`, `@mui/icons-material/<X>`,
      `@mui/x-date-pickers/<X>`; lodash only as `lodash/fp`.
- Styling
    - MUI styling via `sx` or `styled`, **never the `style` prop**. Two existing `style` uses
      (MobileBottomBar `--Paper-overlay`, ReaderBottomBarMobile's ReaderChapterList) go away when those
      files are rewritten.
    - Theme first: anything that applies to every instance of an MUI component belongs in the theme
      overrides (foundation), not in screens. Screens only add layout and screen-specific styling.
- Strings
    - Every user-visible string goes through lingui (`useLingui().t`, `msg`, `plural`). Reuse
      existing message ids: grep `src/i18n/locales/en.po` before adding a string.
    - Areas **don't run `pnpm i18n:extract`**; the Integrate phase runs it once.
- Types and cleanliness
    - Proper types: no `any`, no `@ts-ignore`/`@ts-expect-error`, no non-null `!` where a guard fits.
    - No dead code, no commented-out code, no duplicated styling: shared values come from the tokens
      in section 9.
    - Comments explain why, not what.
- Rebase-friendly (upstream keeps moving)
    - Prefer theme overrides and new components over rewriting upstream files.
    - When a file has to change, keep its exports and props stable, keep the diff local, and don't
      reformat untouched code. Format changed files with the repo's formatter:
      `pnpm exec oxfmt --write <files>` (check with `--check`). Never run `pnpm format`, which
      rewrites the whole tree.
- Keep every feature and setting working. Don't remove features or settings.
- Keep storage compatible
    - Don't rename metadata keys, GraphQL operations, routes, URL query params, or localStorage keys
      (`appTheme`, `mui-mode`, `NavBar::isCollapsed`, `suwayomi_webui_<subpath>_theme_background`, …).
    - Changing a _default_ value is allowed only where this spec says so.
- Stay inside your owned paths (section 14). Changes needed elsewhere go in your result under
  `requests`, with the file, the change and why.
- Icons
    - Prefer the `*Rounded` variants (`@mui/icons-material/<Name>Rounded`) when you touch a file
      anyway; don't touch files only to swap icons.
    - Unselected nav and toggle states use `<Name>Outlined`; selected states use `<Name>` (filled).

## 3. Color tokens

Mihon has no Monet on the web, so the **default theme uses Mihon's default scheme verbatim**
(`P/theme/colorscheme/TachiyomiColorScheme.kt`, seed ≈ `#2979FF`). Pure black applies Mihon's AMOLED
overrides (`P/theme/colorscheme/BaseColorScheme.kt`).

### 3.1 Default scheme

Pure black = dark plus the overrides in the last column (blank = same as dark).

| Role                    | Light     | Dark      | Pure black |
| ----------------------- | --------- | --------- | ---------- |
| primary                 | `#0058CA` | `#B0C6FF` |            |
| onPrimary               | `#FFFFFF` | `#002D6E` |            |
| primaryContainer        | `#D9E2FF` | `#00429B` |            |
| onPrimaryContainer      | `#001945` | `#D9E2FF` |            |
| inversePrimary          | `#B0C6FF` | `#0058CA` |            |
| secondary               | `#0058CA` | `#B0C6FF` |            |
| onSecondary             | `#FFFFFF` | `#002D6E` |            |
| secondaryContainer      | `#D9E2FF` | `#00429B` |            |
| onSecondaryContainer    | `#001945` | `#D9E2FF` |            |
| tertiary                | `#006E1B` | `#7ADC77` |            |
| onTertiary              | `#FFFFFF` | `#003909` |            |
| tertiaryContainer       | `#95F990` | `#005312` |            |
| onTertiaryContainer     | `#002203` | `#95F990` |            |
| background              | `#FEFBFF` | `#1B1B1F` | `#000000`  |
| onBackground            | `#1B1B1F` | `#E3E2E6` | `#FFFFFF`  |
| surface                 | `#FEFBFF` | `#1B1B1F` | `#000000`  |
| onSurface               | `#1B1B1F` | `#E3E2E6` | `#FFFFFF`  |
| surfaceVariant          | `#F3EDF7` | `#211F26` | `#0C0C0C`  |
| onSurfaceVariant        | `#44464F` | `#C5C6D0` |            |
| surfaceTint             | `#0058CA` | `#B0C6FF` |            |
| inverseSurface          | `#303034` | `#E3E2E6` |            |
| inverseOnSurface        | `#F2F0F4` | `#1B1B1F` |            |
| error                   | `#BA1A1A` | `#FFB4AB` |            |
| onError                 | `#FFFFFF` | `#690005` |            |
| errorContainer          | `#FFDAD6` | `#93000A` |            |
| onErrorContainer        | `#410002` | `#FFDAD6` |            |
| outline                 | `#757780` | `#8F9099` |            |
| outlineVariant          | `#C5C6D0` | `#44464F` |            |
| scrim                   | `#000000` | `#000000` |            |
| surfaceContainerLowest  | `#F5F1F8` | `#1A181D` | `#0C0C0C`  |
| surfaceContainerLow     | `#F7F2FA` | `#1E1C22` | `#0C0C0C`  |
| surfaceContainer        | `#F3EDF7` | `#211F26` | `#0C0C0C`  |
| surfaceContainerHigh    | `#FCF7FF` | `#292730` | `#131313`  |
| surfaceContainerHighest | `#FCF7FF` | `#302E38` | `#1B1B1B`  |

Mihon's own comments on the roles:

- `secondary` is the unread badge.
- `tertiary` is the downloaded badge.
- `secondaryContainer` is the navigation pill.
- `surfaceContainer` is the navigation bar. The pure-black value stays `#0C0C0C`, "cannot be pure
  black as there's content scrolling behind it".

### 3.2 Extra tokens

| Token                 | Light                    | Dark                     | Pure black           | Source / use                                                                                  |
| --------------------- | ------------------------ | ------------------------ | -------------------- | --------------------------------------------------------------------------------------------- |
| `active`              | `#FFC107`                | `#FFEB3B`                | `#FFEB3B`            | `C/theme/Color.kt`: tint of an active filter icon                                             |
| `surfaceAtElevation3` | `#E9EEFB`                | `#272931`                | `#0E1015`            | `surfaceColorAtElevation(3.dp)` = surface + primary at 8.24 %: action-mode bar, manga toolbar |
| `readerBar`           | `rgba(233,238,251,0.95)` | `rgba(39,41,49,0.9)`     | `rgba(14,16,21,0.9)` | reader overlay bars and navigator pill                                                        |
| `selected`            | `rgba(0,88,202,0.22)`    | `rgba(176,198,255,0.16)` | same as dark         | Mihon `selectedBackground`: secondary at .22 / .16                                            |
| `coverPlaceholder`    | `rgba(136,136,136,0.12)` | same                     | same                 | `#1F888888` behind covers                                                                     |
| `pillOnSurface`       | onBackground at .08      | onBackground at .12      | same as dark         | count pills in tab labels and titles                                                          |
| `inverseError`        | dark `error`             | light `error`            | same as dark         | error icons on inverseSurface (snackbars)                                                     |

Alphas: `SECONDARY_ALPHA = 0.78` (secondary text), `DISABLED_ALPHA = 0.38` (read and disabled).
Both come from `C/components/material/Constants.kt`.

### 3.3 Other themes, custom themes and dynamic cover colors

Every non-default theme is a seed:

- Built-in themes in `Themes.ts` and user custom themes: the seed is `palette.primary.main` for the
  mode.
- Dynamic manga colors: the cover's vibrant color.

A custom theme's `components` apply on top of the M3 overrides: `defaultProps` are deep-merged,
`variants` concatenated, and each `styleOverrides` slot both overrides use becomes `[m3, custom]`
(the M3 slots are mostly functions, which a deep merge would drop). `MuiCssBaseline` resolves both.

A seed becomes a full role table with **`SchemeContent`, spec version 2021** from
`@material/material-color-utilities`. This was checked: from `#2979FF` it reproduces Mihon's dark
primary `#B0C6FF` / onPrimary `#002D6E`.

Role → tone mapping (2021 spec), for reference and for the fallback:

| Roles                                                       | Light (tone)                 | Dark (tone)                |
| ----------------------------------------------------------- | ---------------------------- | -------------------------- |
| primary / onPrimary / primaryContainer / onPrimaryContainer | P40 / P100 / P90 / P10       | P80 / P20 / P30 / P90      |
| secondary family (S), tertiary family (T), error family (E) | 40 / 100 / 90 / 10           | 80 / 20 / 30 / 90          |
| surface, background / onSurface                             | N98 / N10                    | N6 / N90                   |
| surfaceContainerLowest / Low / (none) / High / Highest      | N100 / N96 / N94 / N92 / N90 | N4 / N10 / N12 / N17 / N22 |
| surfaceVariant / onSurfaceVariant                           | NV90 / NV30                  | NV30 / NV80                |
| outline / outlineVariant                                    | NV50 / NV80                  | NV60 / NV30                |
| inverseSurface / inverseOnSurface / inversePrimary          | N20 / N95 / P80              | N90 / N20 / P40            |

The third column of the container row is `surfaceContainer` (N94 light, N12 dark).

Rules:

- A theme's `palette.secondary.main`, when it's defined, seeds the **tertiary** family. This keeps
  the theme's accent; M3 `secondary` stays the desaturated partner of primary.
- A theme that defines `palette.background.default` or `paper` overrides `background` and `surface`
  only. Container roles still come from the generator.
- Pure black applies the same overrides as the default theme (section 3.1, last column) to every
  generated dark scheme.
- `active`, `selected` (from that scheme's secondary), `surfaceAtElevation3` and `readerBar` are
  derived the same way for every scheme.
- **Fallback, if the dependency isn't approved:** the same function signature, implemented with
  `polished`. A tone `t` is the seed hue with `setLightness(t / 100)`. Saturation is
  `min(seedSaturation, 0.9)` for primary, 0.25 for secondary, 0.06 for neutral, and 0.12 for
  neutral variant. It must reproduce nothing exactly; the default theme never goes through it.

## 4. Typography

- **Font stack:**
  `system-ui, -apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif`.
  That's SF Pro on iOS and Roboto on Android. No webfonts and no CDNs; `ThemeFontLoader` stays only
  for custom theme fonts.
- Drop `fontSize: 13` and `responsiveFontSizes` from `ThemeCreator.ts`. Sizes are fixed, MUI's base
  is 14, and `pxToRem` is exact.
- Every variant is generated from one table; there are no hand-written duplicates.

| M3 style       | Size / line height (px) | Weight | Tracking (px) | MUI variant                        |
| -------------- | ----------------------- | ------ | ------------- | ---------------------------------- |
| displayLarge   | 57 / 64                 | 400    | -0.25         | —                                  |
| displayMedium  | 45 / 52                 | 400    | 0             | —                                  |
| displaySmall   | 36 / 44                 | 400    | 0             | `h1`                               |
| headlineLarge  | 32 / 40                 | 400    | 0             | `h2`                               |
| headlineMedium | 28 / 36                 | 400    | 0             | `h3`                               |
| headlineSmall  | 24 / 32                 | 400    | 0             | `h4`                               |
| titleLarge     | 22 / 28                 | 400    | 0             | `h5`                               |
| titleMedium    | 16 / 24                 | 500    | 0.15          | `h6`, `subtitle1`                  |
| titleSmall     | 14 / 20                 | 500    | 0.1           | `subtitle2`                        |
| bodyLarge      | 16 / 24                 | 400    | 0.5           | `body1`                            |
| bodyMedium     | 14 / 20                 | 400    | 0.25          | `body2`                            |
| bodySmall      | 12 / 16                 | 400    | 0.4           | `caption`                          |
| labelLarge     | 14 / 20                 | 500    | 0.1           | `button` (`textTransform: none`)   |
| labelMedium    | 12 / 16                 | 500    | 0.5           | —                                  |
| labelSmall     | 11 / 16                 | 500    | 0.5           | `overline` (`textTransform: none`) |

- All 15 M3 names are also registered as MUI variants (`<Typography variant="titleMedium">`) through
  `TypographyVariants` / `TypographyPropsVariantOverrides`. Each also has an **emphasized** twin
  (`titleMediumEmphasized` etc.): weight 400 → 500 and 500 → 700, same metrics.
- Use emphasized sparingly: the selected nav label, the FAB label, and headers that Mihon makes
  SemiBold. Mihon's `header` style = bodyMedium, weight 600, onSurfaceVariant
  (`C/theme/Typography.kt`); register it as `header`.
- Existing `h5` titles automatically become titleLarge 22/28. That's correct for app bar titles;
  screens that used `h5` for section headers switch to `titleMedium` (Mihon's "N chapters"), and
  date headers use `header`.

## 5. Shape

`theme.shape.borderRadius` **stays 4**, so existing numeric `borderRadius` multipliers keep their
meaning. M3 shapes are string constants (`M3_SHAPE`):

| Token               | Value    | Used for                                                                       |
| ------------------- | -------- | ------------------------------------------------------------------------------ |
| none                | `0`      | app bars, nav bar, list rows                                                   |
| extraSmall          | `4px`    | menus (Mihon), covers, tooltips, snackbars, text fields, badge groups          |
| small               | `8px`    | grid item container, chips, FilledIconButton-like overlays, button press morph |
| medium              | `12px`   | cards, small FAB                                                               |
| large               | `16px`   | FAB, extended FAB                                                              |
| largeIncreased      | `20px`   | —                                                                              |
| extraLarge          | `28px`   | dialogs, bottom sheets (top corners), Mihon pills                              |
| extraLargeIncreased | `32px`   | —                                                                              |
| extraExtraLarge     | `48px`   | —                                                                              |
| full                | `9999px` | buttons, nav pill, chips with avatar, search field, switch, slider track       |

## 6. Elevation

M3 uses tonal surfaces first and shadows rarely.

Shadow levels (`theme.shadows`):

- 0: `none`
- 1–2: L1 `0 1px 2px 0 rgba(0,0,0,.3), 0 1px 3px 1px rgba(0,0,0,.15)`
- 3–5: L2 `0 1px 2px 0 rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15)`
- 6–7: L3 `0 1px 3px 0 rgba(0,0,0,.3), 0 4px 8px 3px rgba(0,0,0,.15)`
- 8–11: L4 `0 2px 3px 0 rgba(0,0,0,.3), 0 6px 10px 4px rgba(0,0,0,.15)`
- 12–24: L5 `0 4px 4px 0 rgba(0,0,0,.3), 0 8px 12px 6px rgba(0,0,0,.15)`

Per component:

- No shadow: app bar, nav bar and rail, tabs, cards (flat), dialogs and sheets (tonal, scrim
  separates them).
- Menus and popovers: L2.
- FAB: L3 (hover L4).
- Dragged list row (download queue): L2 on surfaceContainerHigh.

Paper's dark-mode overlay gradient (`--Paper-overlay` / `backgroundImage`) is **removed**: colors
come from the surface roles.

## 7. Motion

Easings (`M3_EASING`):

- emphasized `cubic-bezier(0.2, 0, 0, 1)`
- emphasizedDecelerate `cubic-bezier(0.05, 0.7, 0.1, 1)`
- emphasizedAccelerate `cubic-bezier(0.3, 0, 0.8, 0.15)`
- standard `cubic-bezier(0.2, 0, 0, 1)`
- standardDecelerate `cubic-bezier(0, 0, 0, 1)`
- standardAccelerate `cubic-bezier(0.3, 0, 1, 1)`

Durations (`M3_DURATION`, ms):

| Group     | 1   | 2   | 3   | 4    |
| --------- | --- | --- | --- | ---- |
| short     | 50  | 100 | 150 | 200  |
| medium    | 250 | 300 | 350 | 400  |
| long      | 450 | 500 | 550 | 600  |
| extraLong | 700 | 800 | 900 | 1000 |

MUI `theme.transitions` mapping:

- Easings: `easeInOut` = standard, `easeOut` = emphasizedDecelerate, `easeIn` = emphasizedAccelerate,
  `sharp` = standardAccelerate.
- Durations:

    | MUI duration   | ms  |
    | -------------- | --- |
    | shortest       | 100 |
    | shorter        | 150 |
    | short          | 200 |
    | standard       | 300 |
    | complex        | 400 |
    | enteringScreen | 400 |
    | leavingScreen  | 200 |

**Expressive springs** (`M3_SPRING`, the M3E motion scheme Mihon runs) as CSS `linear()` curves.
They were generated from the spring equations (25 samples).

- fastSpatial: damping 0.6, stiffness 800, **347 ms**, overshoot 9.4 %.
  `linear(0, 0.071, 0.235, 0.435, 0.631, 0.8, 0.929, 1.017, 1.069, 1.092, 1.094, 1.083, 1.065, 1.046, 1.028, 1.014, 1.003, 0.996, 0.992, 0.991, 0.991, 0.993, 0.995, 0.996, 1)`
- defaultSpatial: damping 0.8, stiffness 380, **411 ms**; slowSpatial: damping 0.8, stiffness 200,
  **567 ms**. Same curve for both:
  `linear(0, 0.047, 0.155, 0.291, 0.432, 0.563, 0.677, 0.771, 0.846, 0.903, 0.945, 0.974, 0.994, 1.005, 1.012, 1.015, 1.015, 1.014, 1.012, 1.01, 1.008, 1.006, 1.004, 1.003, 1)`
- fastEffects: damping 1, stiffness 3800, **137 ms**; defaultEffects: stiffness 1600, **211 ms**;
  slowEffects: stiffness 800, **299 ms**. Same curve for all three, no overshoot:
  `linear(0, 0.049, 0.157, 0.284, 0.41, 0.525, 0.623, 0.705, 0.771, 0.824, 0.866, 0.898, 0.923, 0.942, 0.957, 0.968, 0.976, 0.982, 0.987, 0.99, 0.993, 0.995, 0.996, 0.997, 1)`

Rules:

- **Spatial** springs (position, size, shape, scale) only on `transform` and `border-radius`.
  **Effects** springs on `opacity` and colors. Never animate layout properties in long lists.
- Where they're used:
    - nav pill: fastSpatial
    - FAB expand/collapse and button press morph: fastSpatial
    - switch thumb: fastSpatial
    - tab indicator and sheet slide-in: defaultSpatial
    - dialog enter: fade (defaultEffects) + scale 0.92 → 1 (fastSpatial)
    - top bar color: defaultEffects
    - description caret rotation: defaultSpatial
- `linear()` needs Safari 17.2 or Chrome 113. Older engines drop the declaration and the change is
  instant, which is acceptable.
- Reduced motion: `m3Transition` multiplies every duration by `var(--m3-motion-scale, 1)`, and the
  `CssBaseline` override sets `--m3-motion-scale: 0` on `:root` under `prefers-reduced-motion: reduce`.
  Script and keyframe animations (route transition, bottom action menu) check the media query
  themselves. There's no global `!important` rule, so MUI's own transitions keep their timing.
- Route change within a stack (e.g. Settings → Appearance): Mihon's shared-axis X, the incoming
  screen slides in 30 px from the end and fades in after the first 35 % (medium2, emphasizedDecelerate;
  reversed for back and RTL; `useRouteSharedAxisTransition`). Home tab switches keep the fade-through.
- Mihon specifics that stay tweens:
    - Reader bars: slide 200 ms + fade 150 ms, standard easing (`P/reader/appbars/ReaderAppBars.kt`).
    - Home tab switch: fade-through, outgoing fade 90 ms, incoming fade + scale 0.92 → 1 over 210 ms
      after the outgoing (`materialFadeThrough`, 200–300 ms total).

## 8. States and alphas

- State layers (M3): hover 0.08, focus 0.10, pressed 0.10 of the content color, dragged 0.16.
  MUI palette:
    - `action.hoverOpacity` 0.08, `focusOpacity` 0.10, `activatedOpacity` 0.10
    - `action.hover` = onSurface at .08
    - `action.selected` = the `selected` token (section 3.2)
    - `action.active` = onSurfaceVariant
    - `action.disabled` = onSurface at .38; `action.disabledBackground` = onSurface at .12
    - TouchRipple child opacity 0.12
- Text:
    - `text.primary` = onSurface
    - `text.secondary` = onSurface at **.78** (Mihon's `secondaryItemAlpha`)
    - `text.disabled` = onSurface at .38
- **Read** rows (chapters, updates) render at .38; secondary lines of unread rows at .78.

## 9. MUI integration

### 9.1 Files (foundation creates; names are a contract)

`src/features/theme/m3/`:

| File                        | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `M3.types.ts`               | `M3ColorRole` (union of the role names in section 3.1), `M3ColorRoles`, `M3Palette` (roles + section 3.2 extras), `M3TypeStyle`, `M3Spring`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `M3Color.constants.ts`      | `MIHON_DEFAULT_COLORS` (`{ light, dark }`), `PURE_BLACK_OVERRIDES`, `ACTIVE_COLOR`, `SECONDARY_ALPHA`, `DISABLED_ALPHA`, `M3_STATE_LAYER_ALPHA` (`hover` .08, `focus` .10, `pressed` .10, `dragged` .16), `SCRIM_ALPHA`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `M3Color.utils.ts`          | `createM3Palette({ seed?, tertiarySeed?, backgroundOverride?, mode, pureBlack }): M3Palette` (default theme = no seed = tables), `surfaceAtElevation(palette, dp)`, `applyStateLayer(container, content, alpha)` (opaque hover/pressed color), `createMuiPaletteFromM3` (section 9.2)                                                                                                                                                                                                                                                                                                                                                |
| `M3Typography.constants.ts` | `M3_FONT_FAMILY`, `M3_TYPE_SCALE` (section 4 table)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `M3Typography.utils.ts`     | `createM3TypographyOptions(fontFamily)`, the variant mapping (labels render as `span`, the rest as `p`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `M3Shape.constants.ts`      | `M3_SHAPE`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `M3Elevation.constants.ts`  | `M3_ELEVATION` (`level0`–`level5`, section 6), `M3_SHADOWS` (`theme.shadows`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `M3Layout.constants.ts`     | `M3_LAYOUT` (`topAppBarHeight` 64, `navigationBarHeight` 80, `navigationRailWidth` 80, `minTouchTarget` 48, `screenPadding` 16), `M3_BUTTON` (button heights 32/40/48 and inline paddings: filled 24, text 12, small 12, with icon 16), `M3_CSS_VARIABLE` (names of `--app-bar-height` and `--app-bottom-bar-height`, set on `:root` by the app bar and including the insets, and `--m3-slider-gap-color`)                                                                                                                                                                                                                           |
| `M3Motion.constants.ts`     | `M3_EASING`, `M3_DURATION`, `M3_SPRING` (`{ easing: string, duration: number }`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `M3Motion.utils.ts`         | `m3Transition(properties: string[], spring: M3Spring): string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `M3ConnectedButtonGroup.ts` | `connectedButtonGroupSx(theme)`: the M3E connected group for a row of `Button`s (selected = `contained`, others `outlined`), used by `SelectButton`/`ButtonSelectInput`; its pieces (`connectedButtonGroupItemSx`, `connectedButtonGroupSelectedItemSx`, `connectedButtonGroupOuterCornersSx`, `CONNECTED_BUTTON_GROUP_GAP` `'2px'`, `CONNECTED_BUTTON_GROUP_FULL_RADIUS` 20) also style `ToggleButton(Group)`/`ButtonGroup`. "Full" corners in a group are half the 40 px button height, not `M3_SHAPE.full`: CSS scales down all corners of a box whose adjacent radii exceed its size, which would square the 8 px inner corners. |
| `M3TabIndicator.tsx`        | the Tabs indicator slot (installed by the theme): a bar as wide as the selected tab's label                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `M3ComponentOverrides.ts`   | `createM3ComponentOverrides(): Components<Theme>` (colors come from the scheme through the theme callbacks, so it takes no argument)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

Wiring:

- `src/lib/mui/MuiStyles.types.d.ts` augments:
    - `Palette.m3: M3Palette` and `PaletteOptions.m3?`
    - typography variants
    - a Button `tonal` variant
- `ThemeCreator.createTheme(...)` keeps its signature and callers. It builds the palette with
  `createM3Palette`, maps the standard keys, and installs typography, shadows, transitions and
  component overrides.
- Areas use roles in `sx` as palette paths, e.g. `bgcolor: 'm3.surfaceContainerHigh'` or
  `color: 'm3.onSurfaceVariant'`, and the constants for shapes and motion. Inline hex values in area
  code are a review failure.

### 9.2 Standard palette keys

| MUI key                           | Value                                                            |
| --------------------------------- | ---------------------------------------------------------------- |
| `primary.main` / `contrastText`   | primary / onPrimary; `light` and `dark` = primary (no tint math) |
| `secondary.main` / `contrastText` | secondary / onSecondary                                          |
| `error`                           | error / onError                                                  |
| `success`                         | tertiary / onTertiary                                            |
| `info`                            | primary / onPrimary                                              |
| `warning.main`                    | `active` (yellow/amber); contrastText `#000000`                  |
| `background.default`              | surface                                                          |
| `background.paper`                | surfaceContainerLow                                              |
| `text.*`, `action.*`              | section 8                                                        |
| `divider`                         | outlineVariant                                                   |

### 9.3 Component overrides (`createM3ComponentOverrides`)

Sizes are in px.

- **CssBaseline**
    - html/body: background surface, font smoothing antialiased, `-webkit-tap-highlight-color:
transparent`, `-webkit-text-size-adjust: 100%`, `color-scheme` per mode.
    - `@media (hover: hover)` scrollbar styling stays.
- **AppBar**: `elevation 0`, `color: inherit`, background surface (section 11.1), color onSurface,
  no backgroundImage.
- **Toolbar**: min height 64 at every breakpoint, padding 0 4.
- **IconButton**
    - Hit box 48 × 48; visual state layer and ripple 40 × 40 centered (inset 4), circle.
    - Icon 24, color inherit or onSurfaceVariant.
    - `edge` margins adjusted so a start icon sits at x = 4.
    - `size="small"`: hit box 40, state layer 32 (desktop dense only).
- **Button**
    - Height 40, radius full, labelLarge, no uppercase, no shadow.
    - Padding 0 24 (with a start icon: 0 24 0 16, icon 18, gap 8); text variant padding 0 12.
    - Colors:

        | Variant     | Background         | Content              | Notes                      |
        | ----------- | ------------------ | -------------------- | -------------------------- |
        | contained   | primary            | onPrimary            | hover L1 shadow            |
        | tonal (new) | secondaryContainer | onSecondaryContainer |                            |
        | outlined    | —                  | primary              | 1 px outlineVariant border |
        | text        | —                  | primary              |                            |

    - M3E press morph: radius full → 8 on `:active`, fastSpatial.
    - `size="small"`: height 32, padding 0 12, labelMedium.
    - Touch band: a button lower than 48 takes touches in a 48 band around it (`::after`), like
      Compose's minimum interactive size.
- **ButtonGroup / ToggleButtonGroup**: M3E connected group.
    - Height 40, 2 px gap, outer corners full, inner corners 8 (4 while pressed).
    - Unselected: surfaceContainerHighest bg, onSurfaceVariant content.
    - Selected: secondaryContainer bg, onSecondaryContainer content, leading check 18, morphs to full
      radius (fastSpatial).
- **Fab**
    - Circular: 56 × 56, radius 16. Small: 40 × 40, radius 12. Extended: height 56, radius 16,
      padding 0 16, icon 24, gap 8, label titleMedium.
    - Colors primaryContainer / onPrimaryContainer, L3 shadow.
    - No `color="primary"` override needed; that prop maps to the same container colors.
- **Card**: elevation 0, bg surfaceContainerLow, radius 12, no backgroundImage. `variant="outlined"`:
  surface bg with 1 px outlineVariant.
- **Paper**: backgroundImage none; elevation → shadows (section 6). Sheet and dialog colors are set
  per component.
- **Menu / Popover / Autocomplete popper**
    - Paper surfaceContainer, radius 4 (Mihon), L2, min width 112, max width 280, list padding 8 0.
    - MenuItem: min height 48, padding 0 12, labelLarge onSurface.
    - ListItemIcon inside menus: onSurfaceVariant, min width 36.
    - Selected: `selected` bg. Disabled: .38.
- **Dialog**
    - Paper surfaceContainerHigh, radius 28, no shadow, margin 24 (phone), min width 280,
      max width 560. Backdrop scrim at .32.
    - Title: headlineSmall onSurface, padding 24 24 16.
    - Content: bodyMedium onSurfaceVariant, padding 0 24.
    - Actions: padding 24 24 24 24 (top 0), gap 8, end-aligned.
    - `fullScreen` dialogs: surface, radius 0.
- **Drawer** (non-bottom): surfaceContainerLow. The bottom anchor is handled by `AdaptiveSheet`.
- **Tabs / Tab** (Mihon `PrimaryTabRow`, `C/components/material/Tabs.kt`)
    - Height 48, bg surface, 1 px outlineVariant bottom divider.
    - Indicator 3 px primary, rounded top corners 3, width of the label content (min 24), slides with
      defaultSpatial.
    - Label titleSmall; selected primary, unselected onSurface. No uppercase.
    - Scrollable: min width 90, padding 0 16, `edgePadding 0`.
- **List / ListItem / ListItemButton** (Mihon preference row, `P/more/settings/widget/BasePreferenceWidget.kt`)
    - Padding 16 left / right, min height 56.
    - ListItemText primary: 16 / 24, weight 400, onSurface, max 2 lines. Secondary: bodySmall at .78.
    - Text block vertical padding 16 (8 + 8 for two-line rows).
    - ListItemIcon: **primary** tint, min width 48 (icon 24 + 24 gap → text at x = 64).
    - Selected bg `selected`; hover state layer.
- **ListSubheader**: Mihon `PreferenceGroupHeader`. secondary color, bodyMedium, padding 14 16 8,
  line height 20, bg transparent (sticky variant: surface).
- **Divider**: outlineVariant, 1 px.
- **Switch** (M3)
    - Root 52 × 32 inside a 48 hit height, track radius full.
    - Unchecked: surfaceContainerHighest track, 2 px outline border, 16 px outline-colored thumb.
    - Checked: primary track, 24 px onPrimary thumb, check icon 16 in onPrimaryContainer optional.
    - Pressed thumb 28. Thumb moves with fastSpatial; colors with fastEffects.
    - Disabled: .12 track / .38 thumb.
- **Checkbox / Radio**: 18 px glyph, 40 state layer in a 48 hit box. Unchecked onSurfaceVariant;
  checked primary with onPrimary mark. Error state error color.
- **Slider** (M3E)
    - Track 16 high, radius full. Active primary; inactive secondaryContainer.
    - Handle 4 × 44, radius 2, primary; 6 px gap between handle and tracks. Implement the gap as a ring
      in the slider's container color, taken from the CSS variable `--m3-slider-gap-color`, which
      defaults to surface.
    - Stop indicator dot 4 px at the inactive end. Value label: inverseSurface pill, labelLarge.
    - Vertical orientation mirrors this.
- **TextField / InputBase**
    - Font 16 px everywhere (**iOS zooms into inputs under 16 px**).
    - Outlined: height 56, radius 4, outline → primary 2 px on focus, label bodyLarge/bodySmall
      floating.
    - Filled: surfaceContainerHighest, top radius 4, underline onSurfaceVariant → primary.
    - Standard (underline) variant: same colors.
- **Chip** (M3 filter/assist chip)
    - Height 32, radius 8, labelLarge, padding 0 16 (8 next to an icon), icon 18.
    - Outlined: 1 px outlineVariant, onSurfaceVariant.
    - Filled or selected: secondaryContainer / onSecondaryContainer, no border.
    - `size="small"`: height 24, radius 8, labelMedium.
    - Clickable: M3 state layer (hover only on hover-capable devices, keyboard focus, press) instead of
      MUI's background tints, which stay on touch screens after a tap; no press shadow.
- **Badge**: error / onError, labelSmall, large 16 high (min width 16, padding 0 4, radius full),
  dot 6.
- **Tooltip**: inverseSurface / inverseOnSurface, radius 4, bodySmall, min height 24, padding 4 8.
- **Snackbar** (MUI and notistack via `SnackbarWithDescription`)
    - inverseSurface / inverseOnSurface, radius 4, bodyMedium, min height 48, padding 4 8 4 16.
    - Action: TextButton in inversePrimary.
    - Placed bottom center, 8 px above the bottom nav or the bottom safe area; max width 560 (full
      width minus 16 on phones).
- **LinearProgress**: height 4, radius full, track secondaryContainer with a 4 px gap to the
  indicator, indicator primary, stop dot 4 px (determinate).
- **CircularProgress**: 40 px, stroke 4, primary, round caps; determinate track secondaryContainer
  with a gap.
- **Skeleton**: surfaceContainerHigh.
- **Alert**: radius 12, surfaceContainerHigh bg, icon in the severity color (error / active /
  primary / tertiary), bodyMedium.
- **Accordion**: flat, no shadow, divider between items, surface bg.
- **Backdrop**: scrim at .32.

## 10. Components (base, foundation-owned)

New components live in `src/base/components/`; existing ones keep their exports and props. The table
is the contract the areas build on.

| Component                                                         | Path                                                | Purpose / spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ListRow`                                                         | `lists/ListRow.tsx` (new)                           | Flat, full-bleed row: ripple and state layer, padding 0 16, `minHeight` 56/64/72/88/96, slots `leading` / `headline` / `supporting` / `trailing`, `selected` (`selected` bg), `dimmed` (read: text color at alpha .38, so parts with their own color, e.g. a bookmark, keep full strength), `onClick` or `to` (router link, with optional router `state`), `onLongPress` (which also keeps Android's link menu from opening). Supporting text is at .78 on its text color (`supportingEmphasis="medium"`, the default) or full strength (`"high"`, Mihon's update and history rows); parts with their own color, e.g. pills, keep full strength. The click layer is labelled by headline and supporting text together, so VoiceOver tells rows of the same title apart. `user-select: none` and `-webkit-touch-callout: none` so long-press selection doesn't trigger the iOS callout. |
| `ListGroupHeader`                                                 | `lists/ListGroupHeader.tsx` (new)                   | Mihon `C/components/ListGroupHeader.kt`: padding 8 16, bodyMedium weight 600, onSurfaceVariant.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `StyledGroupHeader`                                               | `virtuoso/StyledGroupHeader.tsx`                    | Restyled to `ListGroupHeader` (same props), sticky bg surface.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `StyledGroupItemWrapper`                                          | `virtuoso/StyledGroupItemWrapper.tsx`               | Deleted: every row it wrapped is a `ListRow` now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `ListSubheader`                                                   | `lists/ListSubheader.tsx`                           | Via theme: PreferenceGroupHeader look.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `TextBadge`, `TextBadgeGroup`                                     | `badges/TextBadge.tsx` (new)                        | Mihon `C/components/Badges.kt`. Badge: bodySmall weight 500, padding 1 3, line height 16, no radius; colors `secondary` (default), `tertiary`, `primary`, `error`; optional icon badge at the text size (12 px, an 18x18 badge). Group: inline-flex, radius 4, overflow hidden; further props (role, aria-label, className) go to its element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `Pill`                                                            | `badges/Pill.tsx` (new)                             | Mihon `C/components/Pill.kt`: radius full, padding 1 6, start margin 4, default bg surfaceContainerHigh, `pillOnSurface` variant, `fontSize` prop (`PILL_FONT_SIZE.title` 14 in titles, `PILL_FONT_SIZE.tab` 10 in tab labels).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `CoverImage`                                                      | `images/CoverImage.tsx` (new)                       | Mihon `P/manga/components/MangaCover.kt`: ratio `book` (2:3) or `square`, radius 4, `coverPlaceholder` bg, uses `SpinnerImage`, `children` overlay slot, `dimmed` (alpha .34 for in-library in browse), no callout or drag. `getCoverImageWidth(ratio, height)` gives the explicit width covers in rows need (WebKit otherwise sizes them from the image's natural width).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `CollapsibleHeader`                                               | `lists/CollapsibleHeader.tsx` (new)                 | Mihon's collapsible section header (source filter groups, migration groups): 48 px row, header-style title, expand arrow, state layer, `aria-expanded`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ChipRow`                                                         | `chips/ChipRow.tsx` (new)                           | Horizontal scrolling row of chips: padding 8 (or 16 for tags), gap 8 (4 for tags), hidden scrollbar, `wrap` mode = FlowRow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `AdaptiveSheet`                                                   | `modals/AdaptiveSheet.tsx` (new)                    | Mihon `C/components/AdaptiveSheet.kt`. **Phone:** bottom sheet, max width 460 centered, top corners 28, surfaceContainerHigh, no handle, max height 90dvh (75dvh where the brief says so), bottom padding `env(safe-area-inset-bottom)` on the sheet itself (theme), so screens don't add their own, slide-up defaultSpatial, drag down past 56 px or tap the scrim to close. **≥ sm:** centered dialog, radius 28, max width 600, 16 px vertical margin. Optional `header` that stays above the scrolling content (e.g. the Tabs of `OptionsTabs`, whose pages pad 8 vertically per `P/components/TabbedDialog.kt`; their rows are full-bleed and pad themselves 24); `contentSx` styles the scrolling part. `hideBackdrop` leaves the content undimmed and `transparent` makes the sheet .75 opaque (the reader's color filter page and its sliders, as upstream's dialog did).      |
| `OptionsPanel`, `OptionsTabs`                                     | `modals/OptionsPanel.tsx`, `modals/OptionsTabs.tsx` | Same props; rendered with `AdaptiveSheet`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `SettingsSheetRows`                                               | `settings/SheetRows.tsx` (new)                      | Mihon `C/components/SettingsItems.kt` rows for sheets: `HeadingItem` (header style, padding 10 24), `CheckboxItem`, `RadioItem`, `TriStateItem` (icons CheckBoxOutlineBlank / CheckBox / DisabledByDefault, primary when set), `SortItem` (ArrowUpward/Downward primary or a 24 spacer), `SliderItem`; row padding 10 24, gap 24 (16 for tri-state), label bodyMedium. Existing `CheckboxInput`, `RadioInput`, `ThreeStateCheckboxInput`, `SortRadioInput` adopt these looks without API change.                                                                                                                                                                                                                                                                                                                                                                                       |
| `ButtonSelectInput`                                               | `inputs/ButtonSelectInput.tsx`                      | Same API, rendered as an M3E connected group (section 9.3).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `SelectButton`                                                    | `buttons/SelectButton.tsx`                          | Same API, rendered as an M3E connected group; the collapsed form of a collapsible one is a tonal button. `slotProps` (stack, buttons) style the group of a non-collapsible one.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `SelectableCollectionSelectMode`, `SelectableCollectionSelectAll` | `collection/components/`                            | Mihon's selection toolbar: a close button in the navigation slot (`useAppNavigationAction`) when the selection is cancelable, select all as a 48 px icon button (Deselect once everything is selected).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `StyledFab`, `DEFAULT_FAB_STYLE`, `DEFAULT_FULL_FAB_HEIGHT`       | `buttons/StyledFab.tsx`                             | Same exports. Position: right `calc(16px + env(safe-area-inset-right))`, bottom 16 above the bottom nav when it's visible, otherwise `calc(16px + env(safe-area-inset-bottom))`. `DEFAULT_FULL_FAB_HEIGHT` updated to match (56 + 16 + offsets).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `useFabExpanded`                                                  | `hooks/useFabExpanded.ts` (new)                     | `true` at the top and while scrolling up, `false` while scrolling down (window scroll, or the given scroll element, e.g. the chapter list's own scroller in the two-pane layout; 8 px hysteresis).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `SelectionFAB`                                                    | `collection/components/SelectionFAB.tsx`            | Same API; small extended FAB look and position; menu per section 9.3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `AppbarSearch`                                                    | `AppbarSearch.tsx`                                  | Same API and behavior (history, suggestions, ctrl+f). Mihon `SearchToolbar` look (`P/components/AppBar.kt`): when open the field replaces the title, no underline, 18 px weight 400, placeholder at .78, leading back/close, trailing clear; closed = 48 px search IconButton.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `EmptyView`, `EmptyViewAbsoluteCentered`                          | `feedback/*`                                        | Mihon `C/screens/EmptyScreen.kt`: face in displayMedium at .78, message bodyMedium at .78, padding 0 24, centered, optional action buttons (tonal).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `LoadingPlaceholder`                                              | `feedback/LoadingPlaceholder.tsx`                   | Same API; indeterminate `WavyCircularProgress`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `WavyCircularProgress`, `WavyLinearProgress`                      | `feedback/WavyProgress.tsx` (new)                   | M3E wavy indicators (SVG). Circular: diameter 40 (+ stroke), stroke 4, wavelength 15, amplitude 1.6, track gap 4, indicator primary, track secondaryContainer. Linear: height 10, stroke 4, wavelength 40 (determinate) / 20 (indeterminate), track secondaryContainer with a 4 px gap and stop dot. Both accept `value` (determinate), `size`, `strokeWidth`, `wavelength`, `amplitude`, `trackAlpha`; the wave flattens to a line at 0 and 1 and with reduced motion. `WAVY_ICON_PROGRESS_PROPS`: a 24 px ring in place of an icon (app bar update and sync).                                                                                                                                                                                                                                                                                                                        |
| `DownloadStateIndicatorCircular`                                  | `downloads/DownloadStateIndicatorCircular.tsx`      | Mihon `P/manga/components/ChapterDownloadIndicator.kt`: 40 state layer in a 48 hit box, indicator 26 (`DOWNLOAD_INDICATOR_SIZE`, shared with the chapter's download button so the rows' indicators line up). Not downloaded: arrow-in-circle (`ArrowCircleDownOutlined`, Mihon `DownloadCircle`) at onSurfaceVariant .78. Queued: a small down arrow (Mihon `DownloadArrow`) inside an indeterminate flat ring. Downloading: the same arrow inside a determinate wavy ring (stroke 2, wavelength 7, amplitude 0.6, track .25). Downloaded: filled `CheckCircleRounded` in onSurfaceVariant. Error: `ErrorRounded` in error. Same props.                                                                                                                                                                                                                                                |
| `DownloadStateIndicatorLinear`                                    | `downloads/DownloadStateIndicatorLinear.tsx`        | Same props; `WavyLinearProgress` while downloading, flat when paused or queued; both tracks start at the same inset.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ThemeList`, `ThemePreview`                                       | `src/features/theme/components/`                    | Mihon `P/more/settings/widget/AppThemePreferenceWidget.kt`: horizontal row, padding 0 16, gap 8. Item 114 wide, 9:16, 4 px border (primary when selected, else outlineVariant), radius 17 outer / 13 inner, mini app bar, cover with badges, and nav bar drawn from the theme's own M3 palette. Label bodyMedium at .78, 2 lines, centered. Create and edit theme buttons keep working.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## 11. App shell, top app bar, navigation

### 11.1 Top app bar (`DefaultNavBar.tsx`; Mihon `P/components/AppBar.kt`)

- Fixed, pinned (never collapses; Mihon uses pinned behavior everywhere, no Large or Medium bars).
- Height 64 + `env(safe-area-inset-top)`, with left/right safe-area padding.
- Color: surface at rest; **surfaceContainer once the window has scrolled** (> 0 px), animated with
  defaultEffects. Use `useScrollTrigger({ disableHysteresis: true, threshold: 0 })`. On pure black
  the bar is `#000000` at rest and `#0C0C0C` scrolled.
- **`useFlatAppBar(enabled = true)`** keeps the bar on surface while scrolling, for screens that attach
  tabs or a chip bar below it (bar and attachment stay one surface): the library while it shows
  category tabs (Mihon `LibraryTab.kt`: `scrollBehavior.takeIf { !showCategoryTabs }`), Browse, and
  `StickyChipBar` (source browse, global search).
- Navigation icon: back arrow (`ArrowBackRounded`, RTL-aware) in a 48 box at x = 4 on non-root
  routes.
- `useAppBarProgress({ value, 'aria-label' })` draws a determinate `WavyLinearProgress` along the
  bar's bottom edge (the running library update).
- Title: titleLarge onSurface, 1 line ellipsis. x = 16 without a navigation icon, x = 56 with one.
- Actions: right-aligned 48 px icon buttons, last one at 4 from the edge. On phones at most 3 icons
  plus an overflow (MoreVert) per Mihon `AppBarActions`. Areas group the rest into their overflow
  menu.
- Desktop: unchanged structure (collapse button, drawer offset), same visual tokens.
- **New hook `useAppBarOverlay(enabled: boolean, revealAfterPx?: number)`** in
  `src/features/navigation-bar/hooks/`, for the manga page (Mihon `P/manga/components/MangaToolbar.kt`):
    - While enabled, the bar is transparent until the window scrolls at all, then takes the scrolled
      color; the title stays hidden until `scrollY > revealAfterPx` (default 0) and then fades in
      (defaultEffects). Mihon `MangaScreen.kt`: the background follows the first visible item's
      offset, the title the reveal.
    - The main container drops its `mt: appBarHeight`, so the screen content starts under the bar and
      pads itself with `appBarHeight`.
    - Exposed through `NavbarContext` (`isAppBarOverlay`); reset on unmount.
- **Action mode** (Mihon `AppBar` with `actionModeCounter`): `useAppBarActionMode({ title, actions,
onCancel }, deps)`, called from the screen's content while it has a selection, turns the bar into
  the selection toolbar: surfaceAtElevation3 (Mihon's `surfaceColorAtElevation(3.dp)`), a Cancel (×)
  navigation icon, the count as the title and the given actions (select all). Library and the chapter
  list use it; the migration screens keep their own select mode.
- `useHiddenAppBar(enabled)` hides the bar (Mihon's More tab has none on phones).

### 11.2 Bottom navigation bar, phone (`MobileBottomBar.tsx`, `NavigationBarItem.tsx`)

Mihon `U/home/HomeScreen.kt`, M3 NavigationBar.

- Fixed bottom, height 80 + `env(safe-area-inset-bottom)`, left/right safe-area padding,
  bg surfaceContainer, no shadow, no divider. Shown on main routes only (current behavior).
- Items share the width equally; each is a 48+ px tall tap target over the full item.
- Indicator pill: 64 × 32, radius full, secondaryContainer, top 12. Entrance: scaleX 0.5 → 1 plus
  fade, fastSpatial.
- Icon 24 centered in the pill:
    - Selected: filled icon, onSecondaryContainer.
    - Unselected: outlined icon, onSurfaceVariant.
- Label 4 below the pill: labelLarge per Mihon (14/20, weight 500, also when selected); selected
  onSurface, unselected onSurfaceVariant. Always shown.
- Badge: large badge (error/onError, labelSmall) at the icon's top-right (+ 4 / − 4 offset) for the
  existing badge sources (browse extension updates); dot badge where the item only signals.
- Tapping the active item scrolls to top (`window.scrollTo({ top: 0, behavior: 'smooth' })`).
- `bottomBarHeight` in `NavbarContext` keeps being measured (it includes the inset), so screens and
  FABs stay correct.
- Remove the `style` prop and `--Paper-overlay` hack.
- **Bottom action menu** (Mihon `C/components/BottomActionMenu.kt`), phones only: while a selection is
  active, `useAppBottomActionMenu(menu, deps)` puts `BottomActionMenu` in the nav bar's place. Fixed
  bottom, surfaceContainerHigh, top corners large (16), padding 12 (+ bottom inset) 8, equal-width
  48 px icon buttons with tooltips; an action is either a click or a menu. It measures itself into
  `bottomBarHeight` like the nav bar and slides up (skipped with reduced motion). Library: change
  categories, mark as read, mark as unread, download (menu), more (delete, migrate, remove from
  library). Chapters: only the actions that change something (bookmark/unbookmark, mark as read/unread,
  mark previous as read for one chapter, download, cancel download, delete), plus "open in browser /
  WebView" for one chapter. Desktop keeps `SelectionFAB` and the header actions.

### 11.3 Desktop navigation (`DesktopSideBar.tsx`)

- Keep the collapsible drawer, its widths and `NavBar::isCollapsed`.
- **Expanded** = M3 navigation drawer:
    - bg surfaceContainerLow, padding 12.
    - Items 56 tall, radius full, padding 0 16, icon 24, gap 12, labelLarge.
    - Active: secondaryContainer bg, onSecondaryContainer content, filled icon. Inactive:
      onSurfaceVariant.
    - Badges as trailing labelLarge text or a large badge.
- **Collapsed** = navigation rail:
    - 80 wide, bg surfaceContainer.
    - Items: 56 × 32 pill, icon 24, label labelMedium 12 below, 12 between items.

### 11.4 Shell layout (`App.tsx`)

- Root `min-height: 100dvh` (fallback `100vh` first); the nav container uses 100dvh too.
- Main content keeps `mt = appBarHeight` (unless overlay), `pb = bottomBarHeight` or the bottom
  inset, and the right inset.
- Home tab switch (Library/Updates/History/Browse/More) fades through (section 7): the main
  container is keyed by `useHomeTabFadeThrough` (`navigation-bar/hooks`), so the incoming tab plays the
  fade + scale-in; the outgoing tab unmounts at once. Nested routes don't animate.
- Routes, ReaderApp, `MigrationFABIndicator`, providers and `CssBaseline enableColorScheme` stay.

### 11.5 Login and splash (`src/features/authentication`)

- Login is centered, max width 400, padding 24:
    - logo 64
    - headlineSmall title
    - outlined text fields (16 px font)
    - full-width filled Button 40
    - errors as bodySmall in error
- Uses 100dvh and safe-area padding.
- SplashScreen: surface bg with the logo and a wavy circular indicator.

## 12. iOS and PWA

`index.html`:

- Keep the viewport meta (`viewport-fit=cover` is already there; don't add `user-scalable=no`).
- Add `<meta name="apple-mobile-web-app-capable" content="yes">`; keep `mobile-web-app-capable`,
  `apple-mobile-web-app-status-bar-style="black-translucent"` and `apple-mobile-web-app-title`.
- Add `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FEFBFF">` and
  `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1B1B1F">` for first paint.
- The inline script and `AppThemeContext` update **every** `meta[name="theme-color"]` (not just the
  first) to the active top-bar color, i.e. surface (`#000000` on pure black).
- They keep writing and reading `suwayomi_webui_<subpath>_theme_background` with that value.

`src/index.css`, kept tiny:

- `html { background: <set at runtime>; -webkit-text-size-adjust: 100%; }`
- `body { margin: 0; }`

Everything else goes through `CssBaseline` overrides.

Rules for every screen:

- Bars and sheets pad with `env(safe-area-inset-*)`; content never sits under the home indicator.
- Use 100dvh, never 100vh, in layouts (the iOS URL bar changes the viewport).
- `-webkit-tap-highlight-color: transparent` globally. Ripples and state layers give the feedback.
- Touch targets ≥ 48 × 48 on phones (nav items, app bar actions, list trailing buttons, chips get
  48 px tall hit areas).
- Inputs at ≥ 16 px font (no focus zoom).
- Covers and long-pressable rows: `-webkit-touch-callout: none; user-select: none`.
- Light themes draw a scrim (black at .5, `STATUS_BAR_SCRIM_ALPHA`) over
  `env(safe-area-inset-top)`, like Mihon's status bar scrim, so the white iOS status bar text
  (`black-translucent`) stays readable over light surfaces.
- Reader: `overscroll-behavior: none` on html/body while the reader is mounted and on its scroller
  (no rubber band, no pull-to-refresh). The rest of the app keeps native bounce over the surface
  background.
- `public/site.webmanifest`: names unchanged. `theme_color` and `background_color` stay (iOS
  ignores them).

## 13. Screens

Measurements are px at 393 px width. "Row" means `ListRow` unless stated otherwise.

### 13.1 Library (area `library`)

Mihon references:

- `P/library/components/LibraryToolbar.kt`, `LibraryTabs.kt`, `LazyLibraryGrid.kt`, `LibraryPager.kt`
- `P/library/components/CommonMangaItem.kt`, `LibraryCompactGrid.kt`, `LibraryComfortableGrid.kt`, `LibraryList.kt`, `LibraryBadges.kt`
- `P/library/LibrarySettingsDialog.kt`
- `P/manga/components/MangaCover.kt`, `C/components/Badges.kt`

Top bar:

- Title "Library" plus a `Pill` count (14 px, `pillOnSurface`) when the current condition for the
  size chip holds.
- Actions in Mihon order: search (`AppbarSearch`), filter (FilterList, tinted `m3.active` when any
  filter is active), update (`UpdateChecker` icon, keeps its progress state), then an overflow menu:
  open random, sync (only when sync is enabled; it shows the running sync state), select mode, update category. Every current action stays
  reachable.

Category tabs:

- `TabsMenu` scrollable, edge padding 0, label = name + `Pill` (10 px) count when "show tab size" is
  on.
- Hidden when there's one category (current behavior).
- Sticky under the app bar, surface bg. While the tabs show, the app bar stays on surface when the
  grid scrolls (`useFlatAppBar`), so bar and tabs remain one surface.

Grid (`MangaGrid.tsx`, `BaseMangaGrid.tsx`):

- Container padding 8, gap 4 both ways.
- Keep the column formula (`itemsPerRow = ceil(width / mangaGridItemWidth)`) and the item-width
  setting.
- Each item is a selectable container: radius 8, padding 4, ripple. Selected: bg secondary and title
  color onSecondary.
- 3 columns at 393 → item 123, cover 115 × 172.

Compact grid (default):

- Cover fills the item (radius 4).
- Bottom 33 % gradient from transparent to `rgba(0,0,0,0.667)`.
- Title over it: titleSmall at 12/18, white, `text-shadow 0 0 4px #000`, padding 8, max 2 lines.

Comfortable grid:

- Cover, then the title below with padding 4: 12/18 weight 500, exactly 2 lines (reserve 2).

List mode:

- Row height 56, padding 8 16.
- Leading cover square 40 (radius 4).
- Title bodyMedium 2 lines, padding-left 16.
- Trailing badges, then the continue button with 8 between.

Badges (`MangaBadges.tsx`, using `TextBadgeGroup`):

- Top-start group at inset 4: downloads (tertiary/onTertiary), unread (secondary/onSecondary).
- Top-end group: language or local markers if present (tertiary, uppercase).
- Browse "in library": `CoverImage dimmed` (.34) plus an icon badge (CollectionsBookmark) in the
  start group.
- Badge settings (show unread/download badge) are respected exactly.

Continue reading button:

- FilledIconButton 32 (28 in compact), icon PlayArrow 20 (16), radius 8.
- bg primaryContainer at .9, icon onPrimaryContainer.
- Bottom-end of the cover, inset 6. Tooltip unchanged.

Options sheet (`LibraryOptionsPanel` → `AdaptiveSheet` with tabs Filter / Sort / Display):

- Filter: `TriStateItem` rows; tracker filters as today.
- Sort: `SortItem` rows (arrow on the active one).
- Display:
    - "Display mode" heading plus a `ChipRow` of filter chips (Compact grid / Comfortable grid / List)
    - item width slider (`SliderItem`, existing min/max/step)
    - "Overlay" checkboxes (badges, continue button)
    - "Tabs" checkboxes (show tab size, …)
    - all existing options

Other:

- Selection: long-press (on touch it selects at once, on pointer devices it opens the item menu)
  or select mode as today; selected items as above. While something is selected the app bar is in
  action mode (section 11.1) and, on phones, the bottom action menu replaces the nav bar (section
  11.2); desktop keeps `SelectionFAB`. Global and category update move into the overflow on phones.
  The browser title stays "Library".
- Empty states via `EmptyView`.
- Library settings `/settings/library` and duplicates `/settings/library/duplicates`: preference
  rows (section 13.10 style). Duplicates use `ListRow`s with covers.
- Categories `/settings/categories`:
    - Mihon `P/category/CategoryScreen.kt`: each category is an elevated card (surfaceContainerLow,
      radius 12, elevation 1; elevation 3 while dragged) holding a 72 px row (8 + 56 + 8, Mihon's
      `CategoryListItem`) with a drag handle, name bodyLarge and trailing edit/delete icons. Cards in a column with 16 side padding, 8 top padding
      and 8 gaps.
    - FAB "Add".
    - Dialogs per section 9.3.

### 13.2 Manga details and chapters (area `manga`)

Mihon references:

- `P/manga/MangaScreen.kt` (small layout), `P/manga/components/MangaInfoHeader.kt`, `MangaToolbar.kt`
- `P/manga/components/ChapterHeader.kt`, `MangaChapterListItem.kt`, `ChapterDownloadIndicator.kt`
- `P/track/TrackInfoDialogHome.kt`

App bar (`useAppBarOverlay(true, headerBottom)`):

- Transparent over the header until the window scrolls, then the scrolled color; the title stays
  hidden until scrolled past the info row (Mihon `MangaScreen.kt`).
- Actions, phone: Download (menu, unchanged items), Filter (FilterList, `m3.active` when chapter
  filters are active; opens the chapter options sheet), overflow (all existing `MangaToolbarMenu`
  items: refresh, categories, migrate, share, …).
- Error and refresh states as today.

Backdrop (when `mangaThumbnailBackdrop` is on):

- The cover, `object-fit: cover`, spans the header from y = 0 (under the status and app bar), blur
  4 px, opacity .2.
- Gradient overlay transparent → surface over the full height.

Info row:

- Padding 16; top = `appBarHeight + 16`; gap 16.
- Cover: width 100, 2:3, radius 4, opens the existing full cover view.
- Right column, 2 px gaps:
    - Title titleLarge (no line clamp; long-press copies as today).
    - Author row: PersonRounded 16 + 4 gap + titleSmall at .78. Artist row (BrushRounded) only when it
      differs.
    - Status row: bodyMedium at .78, status icon 16 (Schedule ongoing / DoneAll completed /
      AttachMoney licensed / Close cancelled / Pause hiatus / Block unknown) + " • " + source name.
- Search links (author, source) keep their current behavior.

Action row:

- Padding 16 left/right, 8 top; four equal-width text buttons, each a column: icon 20, gap 4,
  label 12/16 weight 500, centered, about 56 tall, radius 12 ripple.
- Buttons: Library (Favorite / FavoriteBorder, "In library" / "Add to library"), Tracking
  (Sync, or Done + count), WebView (Public), Browser (OpenInNew).
- Colors: primary when active (in library, tracked), onSurface at .38 otherwise. The two link
  buttons always use primary.

Description (`DescriptionGenre`):

- Padding 8 16 0. bodyMedium onSurfaceVariant at .78 (markdown or links as today).
- Collapsed: 3 lines, with a 24 px gradient scrim (transparent → surface) and a centered
  KeyboardArrowDown that rotates 180° on expand (defaultSpatial). Tapping the text toggles.
- Notes (`MangaNotes`) stay above the description in a surfaceContainerHigh box, radius 12,
  padding 12.

Genres:

- Collapsed: `ChipRow` (padding 0 16, gap 4). Expanded: wrap.
- Chips: outlined, height 32, radius 8, label bodySmall 12/16, padding 0 8. Click behavior unchanged.

Chapter header (`ChapterList`):

- "N chapters" titleMedium, padding 4 16.
- Missing chapters: bodySmall in error at .78 to the right.
- On phones the header has no buttons: filter is in the app bar and select-all lives in selection
  mode.
- Desktop split view (≥ md) keeps the header toolbar (filter/sort menu, select all) as 48 px icon
  buttons. Select all is an icon button (SelectAll, Deselect once everything is selected), as in the
  selection toolbars.

Chapter row (`ChapterCard` → `ListRow`, flat, no card):

- Padding 12 8 12 16, two lines with 6 between.
- Line 1:
    - unread dot 8 px primary (gap 4) when unread
    - BookmarkRounded 16 primary when bookmarked
    - title bodyMedium 1 line, onSurface (.38 when read)
- Line 2: bodySmall at .78 (.38 when read): date, then ` • Page N` at .38 when partially read, then
  ` • scanlator`. The date is the date only, like Mihon; upstream's "Today at HH:MM" time is dropped
  on purpose.
- Trailing:
    - `ChapterDownloadButton` (base indicator, 48 box) with a 4 left margin
    - the existing per-row kebab (MoreVertRounded, 48) on pointer devices only; on touch, long-press
      selects (no checkbox while selecting) and every row action is in the bottom action menu
- Selected: `selected` bg plus a checkbox replacing the dot area (keep the existing selection
  semantics).
- Desktop split view: same rows; the list keeps its own scroller ≥ md.

Resume FAB (`ResumeFAB.tsx`, `ChapterListFAB`):

- Small extended FAB "Resume" / "Start" (existing strings) with a filled PlayArrow.
- Collapses to a 56 icon FAB while scrolling down (`useFabExpanded`, following the chapter list's own
  scroller in the desktop split view); hidden while selecting or when nothing is left.

Chapter options (`ChapterOptions`):

- `AdaptiveSheet` with tabs Filter / Sort / Display (Mihon `P/manga/ChapterSettingsDialog.kt`),
  `TriStateItem` / `SortItem` / `RadioItem` rows.

Tracking (`src/features/tracker`):

- Tracker dialog → `AdaptiveSheet`. Each tracker is a row: logo 48 radius 12, then a
  surfaceContainerHigh card (radius 12) with status / chapters / score / dates as 2 × 2 text buttons
  (Mihon `TrackInfoDialogHome`).
- Search dialog: search field + `ListRow`s with covers. Deviation: the summary sits below the row
  at full width, 4 lines, and expands in place with "Show more" / "Show less" when it's cut off
  (Mihon has no expansion).
- Tracking detail buttons keep upstream's two-line title and value ("Status / Reading") instead of
  Mihon's single-line values; they are clipped at Mihon's 6 dp group radius.
- Tracking settings `/settings/tracking`: preference rows.

Copying: the title, author and artist copy on long press, as today; pointer devices show a
"Long press to copy" tooltip (touch devices don't). A long press on an author link doesn't also
search.

Desktop (≥ md):

- Keep the two-column layout (details | chapters) with the same tokens.
- The app bar overlay only applies when the header scrolls with the window (< md).

### 13.3 Reader (area `reader`)

Mihon references:

- `P/reader/appbars/ReaderAppBars.kt`, `ReaderBottomBar.kt`
- `P/reader/components/ChapterNavigator.kt`, `P/reader/ReaderPageIndicator.kt`
- `P/reader/settings/ReaderSettingsDialog.kt`, `P/reader/ReadingModeSelectDialog.kt`, `P/components/AdaptiveSheet.kt`

Overlay (mobile, `ReaderOverlayHeaderMobile`, `ReaderBottomBarMobile`, `MobileReaderProgressBar`):

- Bar color `m3.readerBar`. No shadows.
- Show/hide: top bar slides from the top, bottom group from the bottom, 200 ms slide + 150 ms fade,
  standard easing.

Top bar:

- Full width, padding-top safe-area top, height 64.
- Back (`ReaderExitButton`, ArrowBackRounded) at x = 4.
- Title column at x = 56:
    - manga title in titleLarge, 1 line ellipsis, link to the manga as today
    - chapter name in bodyMedium at .78, 1 line ellipsis
- Actions: library button, bookmark (BookmarkRounded / BookmarkBorderRounded), overflow (Open in
  browser, Open in WebView, Share). **Remove the duplicated Share item** (upstream bug: two identical
  `ShareGuard` blocks).

Bottom group: a column, gap 8, padding-bottom safe-area bottom.

1. **Chapter navigator** (when the progress bar position resolves to bottom):
    - Row with 8 side padding.
    - Previous chapter: FilledIconButton 40 in `readerBar` (SkipPreviousRounded).
    - Pill: flex 1, radius 24, `readerBar`, padding 0 16, height 48. Current page (bodyLarge,
      tabular-nums, min width = total's digits), the M3E slider (padding 0 8, `--m3-slider-gap-color`
      = readerBar), total pages.
    - Next chapter button (SkipNextRounded).
    - Direction follows the reading direction (RTL flips which end is previous/next and the slider).
    - The pill holds a plain M3E slider. The existing STANDARD/segmented progress bar types, read-page
      highlighting and page tooltips stay with the desktop's bottom `StandardReaderProgressBar`
      (known gap: the phone pill doesn't show them).
    - Prev/next reuse the existing chapter navigation (as `ReaderNavBarDesktopNextPreviousButton`
      does) and are disabled at the ends.
2. **Bottom bar**: full width, `readerBar`, padding 0 8, height 56, three 48 px icon buttons spaced
   evenly:
    - **Reading mode** (icon reflects the current mode) → quick-settings sheet.
    - **Chapter list** → existing chapter list in an `AdaptiveSheet` (75dvh).
    - **Settings** → reader settings sheet.

Vertical navigator (position LEFT/RIGHT or AUTO resolving vertical):

- Mihon's vertical variant: pill radius 24, padding 16 0, at 8 from the edge, height 65 % of the
  viewport, aligned to the bottom of the space between the bars (Mihon `ReaderAppBars`,
  `Alignment.BottomCenter`).
- Prev/next buttons at its ends.

Default change: `DEFAULT_READER_SETTINGS.progressBarPosition` AUTO → **BOTTOM** in
`ReaderSettings.constants.tsx`. This matches Mihon's horizontal navigator (`verticalNavigator`
defaults off). Stored values are untouched and all options stay.

Page indicator (`ReaderPageNumber`, visible while the overlay is hidden):

- "cur / total", bodySmall size, bold, letter-spacing 1, color `#EBEBEB`, outlined in `#2D2D2D` (text
  shadow in 8 directions, 1 px).
- Bottom center at 4 + safe-area bottom.

Quick-settings sheet (`ReaderBottomBarMobileQuickSettings`, `AdaptiveSheet`):

- Mihon `ReadingModeSelectDialog`.
- "Reading mode" heading plus an icon grid: columns auto-fill at min 96, gap 8. Each item is a
  48 px FilledIconToggleButton (selected primary/onPrimary, unselected surfaceContainerHighest) with
  a bodySmall label below.
- Reading direction: the same pattern.
- Auto scroll checkbox and speed slider.
- The "default" footnote and reset-to-default affordances stay (as an OutlinedButton "Reset to
  default" where they exist).

Settings sheet (`ReaderSettings` screen/dialog):

- Phone: `AdaptiveSheet` with the existing tabs (`ReaderSettingsTabs`) in a fixed tabs header
  (surfaceContainerHigh, tabs share the width), max height 75dvh.
- Custom filter tab (Mihon): the reader bars hide while it's open and come back after; the sheet has
  no scrim there (`hideBackdrop`), and it turns .75 transparent while a filter or reader-width
  slider is dragged (`transparent`), as upstream's dialog did.
- Rows use sheet rows: enum options as `ChipRow` filter chips or `ButtonSelectInput` connected
  groups, numbers as M3E sliders with value labels, booleans as switches or checkboxes.
- Desktop: centered `AdaptiveSheet` dialog (max width 600).
- Global reader settings `/settings/reader` use the same rows inside the preference page.

Desktop overlay (`ReaderNavBarDesktop*`):

- Same structure; restyled with tokens: surfaceContainer side panel, connected button groups for
  mode/direction, 48 px icon buttons. The page row is the phone's slider pill
  (`ReaderPageSliderPill`, surfaceContainerHighest) between the page arrows, following the reading
  direction; the bottom `StandardReaderProgressBar` keeps upstream's progress bar types.

Viewport:

- Replace `100vh` with `100dvh` in reader layouts and pager utils (behavior otherwise unchanged).
- `overscroll-behavior: none` on html/body while mounted and on the scroller.
- Reader background and status bar area follow the reader background setting, not the theme: the
  reader passes its background to `useThemeColorOverride` (`AppThemeContext`), which the
  theme-color metas follow while it's mounted.

### 13.4 Updates (area `updates-history`)

Mihon references: `P/updates/UpdatesScreen.kt`, `P/updates/UpdatesUiItem.kt`, `C/components/ListGroupHeader.kt`.

Top bar:

- "Updates", actions `UpdateChecker` (refresh icon with progress state, menu Update library /
  Update category), `SyncButton`, overflow if needed.
- `UpdateChecker`'s running state shows a `WavyLinearProgress` (determinate, using its existing
  progress values) in the bottom 10 px of the app bar, through `useAppBarProgress`.

Content:

- "Last update: …" line (existing string): bodyMedium italic at .78, padding 8 16; it scrolls away
  with the list like Mihon's first item.
- Date groups via `StyledGroupHeader` (ListGroupHeader).

Row: height 56, padding 0 16.

- Leading `CoverImage square` 44 (6 vertical padding).
- Text column, padding 0 16:
    - Manga title bodyMedium, 1 line.
    - Line 2 at full strength (`supportingEmphasis="high"`): unread dot 8 primary (gap 4),
      BookmarkRounded 14 primary if bookmarked, chapter name bodySmall 1 line, then ` • Page N` at
      .38 while partially read.
    - Read rows dim the text to .38 (`ListRow dimmed`); the bookmark keeps its full primary color.
    - Deviation: ` • scanlator` after the chapter name (Mihon's `UpdatesUiItem` shows only the
      chapter name); it tells apart the groups of a series several groups scan, and it truncates
      before the chapter name does.
- Trailing `ChapterDownloadButton`.

Other:

- Manga grouping ("Show N more chapters"): a flat TextButton row (primary, labelLarge) indented to
  the text column (x = 76).
- Tap opens the reader; long-press and selection as today.
- Empty: `EmptyView`.

### 13.5 History (area `updates-history`)

Mihon references: `P/history/HistoryScreen.kt`, `P/history/components/HistoryItem.kt`.

- Top bar "History", existing actions (search, clear all, …).
- Date groups via `StyledGroupHeader`.

Row (`ChapterHistoryCard` → `ListRow`): height 96, padding 8 16.

- `CoverImage book` at full height (80 × 53), clickable to the manga.
- Text column, padding 0 16:
    - Title bodyMedium weight 600, 2 lines.
    - Subtitle "Ch. N - time" (existing format) bodyMedium at full strength, margin-top 4.
- Trailing 48 px icon buttons for the existing actions (e.g. remove from history in DeleteOutline,
  add to library in FavoriteBorder when not in library, download indicator if present today).
- Tap resumes reading as today.

History settings `/settings/history`: preference rows. `SyncButton` and its dialog: icon button plus
an M3 dialog.

### 13.6 Browse (area `browse`)

Mihon references:

- `U/browse/BrowseTab.kt`, `P/components/TabbedScreen.kt`
- `P/browse/SourcesScreen.kt`, `ExtensionsScreen.kt`, `MigrateSourceScreen.kt`, `ExtensionDetailsScreen.kt`
- `P/browse/BrowseSourceScreen.kt`, `P/browse/components/BrowseSourceToolbar.kt`, `BaseBrowseItem.kt`,
  `BrowseIcons.kt`, `BrowseBadges.kt`, `GlobalSearchCardRow.kt`
- `P/browse/GlobalSearchScreen.kt`

Browse screen:

- "Browse" app bar.
- Fixed `TabsMenu` (full width, 3 tabs): Sources / Extensions (+ `Pill` with the update count) /
  Migrate. Keep `?tab=` routing. The app bar stays on surface while scrolling (`useFlatAppBar`).
- Actions per tab as today (global search, language filter, extension search, …), max 3 + overflow.

Sources:

- Section headers ("Pinned", "Last used", languages) in `header` style, padding 8 16.
- Row (`BaseBrowseItem`): padding 8 16, min height 64.
    - Icon 40 (radius 8, placeholder Extension icon).
    - Column, padding-left 16: name bodyMedium 1 line, language/subtitle bodySmall at .78.
    - Trailing "Latest" TextButton (primary) when supported; pin IconButton (PushPin filled primary
      when pinned, PushPinOutlined at .78 otherwise).

Extensions:

- Sections (updates pending, installed, available by language) in `header` style.
- Row: icon 40, name bodyMedium, then `lang • version` bodySmall at .78 plus an "18+" bodySmall
  error label.
- Trailing: like Mihon, icon buttons: settings (installed) and a download icon to install or update,
  or a progress indicator while installing. Uninstall (also of obsolete extensions) is on the
  extension's info screen, which the row opens.
- Search via `AppbarSearch`.

Migrate:

- Source rows (icon 40, name, bodySmall language) with a trailing `Pill` count.
- Migration manga list and search screens use `ListRow`s with covers 44 / book covers.

Source browse (`/sources/:id`, `src/features/source`):

- App bar: source name, actions search (`AppbarSearch`), display mode, overflow (WebView,
  configure, …).
- Under it a `ChipRow` of filter chips, padding 8, gap 8, with a divider below (`StickyChipBar`,
  which keeps the app bar on surface like Mihon's toolbar):
    - Popular (Favorite, filled when selected)
    - Latest (NewReleases)
    - Filter (FilterList; opens the existing filters in an `AdaptiveSheet`)
    - Selected chip: secondaryContainer.
- Grid and list via the library-owned grid components (same look); in-library entries dimmed with
  the badge (library area provides).
- Source configure: preference rows.

Global search (`/sources/all/search`, `src/features/global-search`):

- Per source a header row (padding 8 16): source name titleMedium plus language bodySmall at .78,
  trailing ArrowForward 24 (opens that source's search).
- Results: horizontal row, padding 0 16, gap 8, cards 96 wide (comfortable cover + 2-line 12/18
  title; `MangaGrid`'s `itemWidth` replaces the grid width setting there).
- Loading: `WavyLinearProgress` indeterminate (width 96·2, padding 16).
- "No results": bodyMedium at .78. Error: bodyMedium in error.

Extension info (`/extension/:pkg`):

- Header: icon 112 radius 16, name headlineSmall, pkg bodySmall at .78.
- Stats row: version / language / age rating as centered titleMedium + bodySmall pairs, dividers
  between.
- Buttons row: Uninstall OutlinedButton + settings / App info tonal.
- Sources list as rows with switches.

Settings:

- Browse settings and extension stores `/settings/browse/extension-stores`: preference rows; store
  entries are Mihon-style cards (`ExtensionStoresContent.kt`) with their delete action.

### 13.7 More (area `more-settings`)

Mihon references: `P/more/MoreScreen.kt`, `P/more/LogoHeader.kt`,
`P/more/settings/widget/TextPreferenceWidget.kt`.

- No app bar on phones, like Mihon (`useHiddenAppBar`); the logo header pads with the top inset.
  Desktop keeps the "More" app bar.
- Logo header: Suwayomi logo (from `src/assets`, read-only use) 64 px, centered, padding 32 0,
  divider below.
- Rows from the same data as today (`NAVIGATION_BAR_ITEMS` hidden on mobile plus Categories),
  grouped exactly as now with full-width dividers between groups.
    - Each row is a preference row: icon 24 **primary** at x = 16, text at x = 64, title 16/24,
      subtitle bodySmall at .78 (e.g. the download queue status "Paused — N remaining"), padding 16 0,
      min height 56.

### 13.8 Settings (area `more-settings`)

Mihon references:

- `P/more/settings/screen/SettingsMainScreen.kt`, `widget/BasePreferenceWidget.kt`,
  `widget/PreferenceGroupHeader.kt`, `widget/SwitchPreferenceWidget.kt`
- `P/more/settings/screen/SettingsAppearanceScreen.kt`

Settings main (`/settings`):

- Preference rows with primary icons (outlined, as Mihon), title 16/24, and a subtitle listing the
  page's sections like Mihon's ("Theme, Display, Language"), joined from existing message ids only.
- Groups separated by `ListSubheader` (PreferenceGroupHeader) or dividers as today.

Every settings page (WebUI, server, images, image processing, device, appearance, downloads, backup):

- Rows 56+ (title 16/24, subtitle bodySmall at .78, padding 16).
- Trailing switch with a 16 buffer.
- Group headers in secondary (PreferenceGroupHeader).
- Selects open M3 menus or dialogs.
- Number, text and date settings (`src/base/components/settings/*`, foundation-styled) open M3
  dialogs (radius 28, surfaceContainerHigh).
- Destructive actions use error-colored text buttons in dialogs.

Appearance (`/settings/appearance`):

- Theme mode as a `SelectButton` connected group (System / Light / Dark) sharing the row.
- Theme list via the foundation `ThemeList` (Mihon theme previews).
- Pure black switch.
- Existing manga options (thumbnail backdrop, dynamic color, grid width) as preference rows.
- Language select.

### 13.9 Downloads (area `more-settings`)

Mihon references: `U/download/DownloadQueueScreen.kt`, `P/download/DownloadQueueList.kt`.

- App bar "Download queue" + `Pill` count; existing actions (clear, …) in overflow.
- Groups via `ListGroupHeader` ("Source (N)" or the existing grouping) with a drag handle when
  reordering applies.
- Row: padding 0 4 0 8, drag handle 24 (onSurfaceVariant) where dnd applies.
    - Column with padding 8 0 and gap 4:
        - Manga title bodyMedium 1 line + `x/y` bodySmall onSurfaceVariant.
        - Chapter name bodySmall.
        - `DownloadStateIndicatorLinear` (wavy while downloading).
    - Trailing overflow (move to top/bottom, cancel as today).
    - While dragging: surfaceContainerHigh + L2.
- FAB: small extended "Pause" / "Resume" (existing strings, Pause/PlayArrow icons).
- Download settings `/settings/download`: preference rows.

### 13.10 Backup, device, about, app updates (area `more-settings`)

- **Backup** `/settings/backup`: preference rows (create, restore with file picker, auto-backup
  settings); progress as `WavyLinearProgress`; results in M3 dialogs.
- **Device** `/settings/device`: preference rows; device select as a menu.
- **About** `/about` (Mihon `P/more/settings/screen/about/AboutScreen.kt`):
    - logo header
    - preference rows: server version, WebUI version, build info, check for updates, what's new,
      licenses
    - a centered row of 48 px link icon buttons (GitHub, Discord, website as today)
- **App updates** (`src/features/app-updates`): update notices as M3 dialogs / snackbars.

## 14. Work split

### 14.1 Phases

1. **Foundation**, one agent, first. It implements sections 3–12 and the base components. It
   publishes the contract in this spec (file names in section 9.1 and section 10). If it has to
   deviate, it updates this spec and says so in its result.
    - Done when `pnpm run tsc` and `pnpm run lint` are clean.
    - Every screen still renders, with no new runtime errors.
    - The foundation flows (section 15.3) pass on webkit and chromium, dark and light.
2. **Areas**, 6 agents in parallel in the same working tree, each restricted to its owned paths.
3. **Integrate** (orchestrator):
    - merge `requests`
    - run `pnpm i18n:extract` once
    - `pnpm run build`
    - all flows
    - final review
    - per-topic commits

### 14.2 Ownership (exact paths; nothing overlaps)

| Owner                                      | Paths                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| foundation                                 | `index.html`, `public/site.webmanifest`, `src/index.css`, `src/App.tsx`, `src/base`, `src/lib/mui`, `src/features/theme`, `src/features/navigation-bar`, `src/features/authentication`, `src/assets`                                                                                                                                    |
| library                                    | `src/features/library`, `src/features/category`, `src/features/manga/components/cards`, `src/features/manga/components/MangaGrid.tsx`, `BaseMangaGrid.tsx`, `MangaBadges.tsx`, `ContinueReadingButton.tsx`, `ContinueReadingTooltip.tsx`, `MangaOptionButton.tsx`, `MangaActionMenuItems.tsx` (all in `src/features/manga/components/`) |
| manga                                      | `src/features/manga/screens`, `src/features/manga/components/details`, `src/features/manga/components/MangaToolbarMenu.tsx`, `ResumeFAB.tsx`, `TrackMangaButton.tsx`, `src/features/chapter`, `src/features/tracker`                                                                                                                    |
| reader                                     | `src/features/reader`                                                                                                                                                                                                                                                                                                                   |
| updates-history                            | `src/features/updates`, `src/features/history`, `src/features/sync`                                                                                                                                                                                                                                                                     |
| browse                                     | `src/features/browse`, `src/features/source`, `src/features/extension`, `src/features/global-search`, `src/features/migration`                                                                                                                                                                                                          |
| more-settings                              | `src/features/settings`, `src/features/downloads`, `src/features/backup`, `src/features/device`, `src/features/app-updates`                                                                                                                                                                                                             |
| nobody (read-only; changes via `requests`) | `src/features/manga/Manga.types.ts`, `Manga.constants.ts`, `src/features/manga/hooks`, `src/features/manga/services`, `src/features/metadata`, `src/features/hotkeys`, `src/lib` (except `src/lib/mui`), `src/i18n`, `src/index.tsx`, config files, `package.json`, lockfile                                                            |

### 14.3 Shared-API rules

- Exports used outside their owner keep their names and props. Owners may add optional props only.
  This covers:
    - `ChapterCardThumbnail`, `ChapterCardMetadata`, `ChapterDownloadButton`,
      `ChapterDownloadRetryButton`, `ChapterCardExpandButton`, `ChapterListCard` (manga → updates,
      history, downloads, reader)
    - `BaseMangaGrid`, `MangaGrid`, the cards and `MangaBadges` (library → browse, migration, global
      search)
    - `UpdateChecker` (updates → library)
    - `SyncButton` (sync → library, updates)
    - `GlobalReaderSettings` (reader → settings route)
    - `LibrarySettings`, `CategorySettings`, `BrowseSettings`, `HistorySettings`, `DownloadSettings`,
      `TrackingSettings` (rendered by routes in `App.tsx`)
- An area that needs a different look from another area's component composes base components itself
  or files a request. It doesn't edit the other area's files.
- No area edits `App.tsx` routes. Route-level needs are requests to foundation and Integrate.

### 14.4 Result format (every area)

The result reports:

- the files changed
- what was verified (tsc, lint, flows per engine and scheme, screenshots)
- deviations from this spec, with reasons
- `requests`: path, change, reason
- new lingui strings added (so Integrate can extract)
- review findings and how they were fixed

## 15. Testing

### 15.1 Conventions

- Kit: a Playwright project outside this repository (`lib.js`: `open({ dark, device })`, `login(page)`, `shot(page, name)`;
  `spec-guard.js`: `guard(page)`). Run `./run.sh <script.js> webkit` and `… chromium`.
- Each area writes **`m3-<area>.js`** in that folder. The order is fixed:

    ```js
    const { open, login, shot, ENGINE } = require('./lib');
    const { guard } = require('./spec-guard');
    for (const dark of [true, false]) {
        const { browser, page, errors } = await open({ dark });
        const blocked = await guard(page); // ALWAYS right after open(), before login() or any goto
        await login(page);
        // … read-only steps …
        const real = errors.filter((e) => !e.includes('ResizeObserver loop'));
        // fail on real errors; log `blocked`
    }
    ```

- Shots are named `m3-<area>-<dark|light>-<step>`. Base URL: `http://localhost:3100`.
- Read-only means no clicks on anything that mutates: download, mark read, bookmark, delete,
  install, toggles in settings, library add/remove. Opening menus, sheets, dialogs and tabs is fine;
  close them with Escape or the scrim.
    - The reader's automatic progress mutations are expected to show up in `blocked`.
    - Any other blocked mutation means the flow clicked something it shouldn't have, and that fails.
- Scrolling: `page.evaluate(() => window.scrollBy(0, N))` (mobile WebKit has no `mouse.wheel`).
- Desktop check: `open({ dark, device: ENGINE === 'webkit' ? 'Desktop Safari' : 'Desktop Chrome' })`.
- Generic assertions every flow runs per screen:
    - no horizontal overflow: `document.documentElement.scrollWidth <= innerWidth`
    - app bar height 64 and bottom nav 80 (no insets in emulation) where shown
    - every visible `button`, `a`, `[role=tab]` and `[role=button]` inside the app bar, bottom nav and
      list rows has a hit box ≥ 48 × 48 on the phone, or ≥ 40 for chips and the dense desktop
    - no `[style]` attributes introduced by our components: check the specific elements the area
      styles; MUI's own inline transforms are fine
- Test data:
    - `/manga/<id>` below is the first library entry (a series with 20+ chapters)
    - reader `/manga/<id>/chapter/1`; tap (196, 420) toggles the overlay

- WebKit: `page.route` only sees the first few GraphQL requests there, so `guard(page)` doesn't hold.
  Read-only runs use the kit's `safeOpen()` (`rxf-safe.js`): a local proxy in front of the server
  that refuses every mutation except sign-in and the page fetch, records requests that bypass it,
  and (with `standIns`) answers the extension list and source browse fetches from what the server
  already stores.
- Regression: `e2e.js` walks login, library (tabs, options sheet, search), a series, the reader
  (paging, overlay, settings, next chapter, exit), updates, history, browse (sources, a source and
  its search, extensions), more, every settings page, downloads, backup and about, on an iPhone in
  dark and light and on a 1280 × 800 desktop, and prints PASS/FAIL per step.

### 15.2 Area flows (summary; details in each area brief)

- **library**:
    - `/library`: tabs, grid, badges.
    - Scroll 900: app bar turns surfaceContainer.
    - Open the filter sheet and visit the 3 tabs. Open search and type, no submit side effects.
    - `/library?tab=<second tab>`.
    - Desktop `/library`.
    - `/settings/library`, `/settings/categories`.
- **manga**:
    - `/manga/<id>`: transparent bar at top, title hidden.
    - Scroll 900: bar colored with the title visible; chapter rows 1 line + 2 lines; Resume FAB
      collapses on scroll down.
    - Open the chapter filter sheet; open the tracking sheet (read-only).
    - Desktop `/manga/<id>` split view.
- **reader**:
    - `/manga/<id>/chapter/1`; tap (196, 420) shows the overlay: top bar 64 + bottom bar + navigator
      pill.
    - Open the reading-mode sheet, the chapter list sheet, and the settings sheet with every tab;
      close each with Escape.
    - Tap again hides the overlay; the page indicator is visible.
    - Desktop reader.
    - `/settings/reader`.
- **updates-history**:
    - `/updates`: header line, date groups, 56 px rows.
    - Expand a "Show N more" group if present.
    - `/history`: 96 px rows.
    - `/settings/history`.
    - Desktop for both.
- **browse**:
    - `/browse?tab=sources|extensions|migrate`.
    - Open the first source (`/sources/:id`): chip row, grid.
    - Global search `/sources/all/search?query=a` (read-only query).
    - Open the first installed extension's `/extension/:pkg`.
    - `/settings/browse`.
    - Desktop browse.
- **more-settings**:
    - `/more`: logo and rows.
    - `/settings`, `/settings/appearance` (theme previews visible), `/settings/webui`,
      `/settings/server`, `/settings/backup`, `/downloads`, `/about`, `/settings/download`,
      `/settings/device`.
    - Open (and cancel) one number dialog and one select menu.
    - Desktop `/settings`.

### 15.3 Foundation flows

- Every route in section 15.2 renders without new page errors (dark and light, webkit and chromium).
- App bar 64, bottom nav 80 with the pill on the active item.
- Bar color changes on scroll.
- Computed colors match section 3 (owner's pure black in dark; the light table in light):
    - `body` bg = surface
    - bottom nav bg = surfaceContainer
    - pill = secondaryContainer
- `meta[name=theme-color]` values all equal the surface color.
- Inputs compute ≥ 16 px font.
- Tabs fade through on home tab switch.
- Snackbar position check if one is shown by a read-only action; skip otherwise.
- Optional: verify the standard (non-pure-black) dark scheme by rewriting the
  `shouldUsePureBlackMode` value in the `GET_GLOBAL_METADATAS` response with `page.route`
  (client-side only, never a mutation).

## 16. Requests and open decisions

1. **Dependency:** `@material/material-color-utilities@0.4.0` (Apache-2.0, Google's Material color
   library, the official way to build M3 schemes from a seed). Add it as an exact pin for section
   3.3.
    - Needs the orchestrator's or owner's go-ahead because of the "no new dependencies" rule.
    - Without it, foundation implements the documented `polished` fallback behind the same function.
    - The default theme (the one the owner uses) doesn't depend on it either way.
2. **i18n:** areas add strings with lingui macros only; Integrate runs `pnpm i18n:extract` once.
3. **Default change** (reader): `progressBarPosition` AUTO → BOTTOM (section 13.3). It changes what
   users who never set the option see; stored values are untouched.
4. **Out of scope** (possible follow-ups):
    - swipe actions on chapter rows
    - pull-to-refresh
    - Mihon's settings search
    - an iOS splash image (`apple-touch-startup-image`)

## 17. Rebase hot spots

Upstream files this restyle changes the most; expect conflicts there when rebasing on a new
upstream release, and re-check them by eye:

- `src/features/navigation-bar/components/DefaultNavBar.tsx`, `NavbarContext.tsx`,
  `NavigationBar.types.ts` (overlay, flat bar, progress, action mode, bottom menu slots)
- `src/App.tsx` (shell layout, transitions)
- `src/features/library/screens/Library.tsx`, `src/features/chapter/components/ChapterList.tsx`,
  `cards/ChapterCard.tsx`, `src/features/manga/components/cards/MangaCard.tsx` (selection)
- `src/features/manga/screens/Manga.tsx` and `components/details/*` (header layout)
- `src/features/reader/overlay/**` (bars, slider pill, quick settings)
- `src/features/settings/screens/*` (preference rows)
- `src/features/browse/extensions/components/ExtensionCard.tsx`, `src/features/updates/components/*`

New code lives in `src/features/theme/m3/`, `src/base/components/` and the new hooks, so most
conflicts are in screens, not in the design system.
