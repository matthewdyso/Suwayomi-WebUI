/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { M3TypeScaleName, M3TypeStyle } from '@/features/theme/m3/M3.types.ts';

/**
 * The platform font: SF Pro on iOS and macOS, Roboto on Android. No web fonts are loaded for it.
 */
export const M3_FONT_FAMILY =
    'system-ui, -apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

/**
 * MUI's default root font size, which "rem" sizes are based on.
 */
export const M3_HTML_FONT_SIZE = 16;

export const M3_TYPE_SCALE: Record<M3TypeScaleName, M3TypeStyle> = {
    displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: 400, letterSpacing: -0.25 },
    displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: 400, letterSpacing: 0 },
    displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: 400, letterSpacing: 0 },
    headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: 400, letterSpacing: 0 },
    headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: 400, letterSpacing: 0 },
    headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: 400, letterSpacing: 0 },
    titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: 400, letterSpacing: 0 },
    titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: 500, letterSpacing: 0.15 },
    titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
    bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: 400, letterSpacing: 0.5 },
    bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: 400, letterSpacing: 0.25 },
    bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: 400, letterSpacing: 0.4 },
    labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: 500, letterSpacing: 0.1 },
    labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
    labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: 500, letterSpacing: 0.5 },
};

/**
 * Weights of the M3 Expressive "emphasized" type styles, keyed by the regular weight.
 */
export const M3_EMPHASIZED_FONT_WEIGHT: Record<number, number> = {
    400: 500,
    500: 700,
};

/**
 * Mihon's "header" style (presentation-core Typography.kt): bodyMedium in semi bold.
 */
export const M3_HEADER_FONT_WEIGHT = 600;

/**
 * MUI's variants as M3 type styles; MUI's base is 14 px, so "pxToRem" stays exact.
 */
export const MUI_VARIANT_TO_M3_TYPE_SCALE = {
    h1: 'displaySmall',
    h2: 'headlineLarge',
    h3: 'headlineMedium',
    h4: 'headlineSmall',
    h5: 'titleLarge',
    h6: 'titleMedium',
    subtitle1: 'titleMedium',
    subtitle2: 'titleSmall',
    body1: 'bodyLarge',
    body2: 'bodyMedium',
    caption: 'bodySmall',
    button: 'labelLarge',
    overline: 'labelSmall',
} as const satisfies Record<string, M3TypeScaleName>;
