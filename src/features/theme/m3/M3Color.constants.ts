/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { M3ColorRoles, M3Mode } from '@/features/theme/m3/M3.types.ts';

/**
 * Mihon's default color scheme (TachiyomiColorScheme.kt), used verbatim for the default theme.
 */
export const MIHON_DEFAULT_COLORS: Record<M3Mode, M3ColorRoles> = {
    light: {
        primary: '#0058CA',
        onPrimary: '#FFFFFF',
        primaryContainer: '#D9E2FF',
        onPrimaryContainer: '#001945',
        inversePrimary: '#B0C6FF',
        secondary: '#0058CA',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#D9E2FF',
        onSecondaryContainer: '#001945',
        tertiary: '#006E1B',
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#95F990',
        onTertiaryContainer: '#002203',
        background: '#FEFBFF',
        onBackground: '#1B1B1F',
        surface: '#FEFBFF',
        onSurface: '#1B1B1F',
        surfaceVariant: '#F3EDF7',
        onSurfaceVariant: '#44464F',
        surfaceTint: '#0058CA',
        inverseSurface: '#303034',
        inverseOnSurface: '#F2F0F4',
        error: '#BA1A1A',
        onError: '#FFFFFF',
        errorContainer: '#FFDAD6',
        onErrorContainer: '#410002',
        outline: '#757780',
        outlineVariant: '#C5C6D0',
        scrim: '#000000',
        surfaceContainerLowest: '#F5F1F8',
        surfaceContainerLow: '#F7F2FA',
        surfaceContainer: '#F3EDF7',
        surfaceContainerHigh: '#FCF7FF',
        surfaceContainerHighest: '#FCF7FF',
    },
    dark: {
        primary: '#B0C6FF',
        onPrimary: '#002D6E',
        primaryContainer: '#00429B',
        onPrimaryContainer: '#D9E2FF',
        inversePrimary: '#0058CA',
        secondary: '#B0C6FF',
        onSecondary: '#002D6E',
        secondaryContainer: '#00429B',
        onSecondaryContainer: '#D9E2FF',
        tertiary: '#7ADC77',
        onTertiary: '#003909',
        tertiaryContainer: '#005312',
        onTertiaryContainer: '#95F990',
        background: '#1B1B1F',
        onBackground: '#E3E2E6',
        surface: '#1B1B1F',
        onSurface: '#E3E2E6',
        surfaceVariant: '#211F26',
        onSurfaceVariant: '#C5C6D0',
        surfaceTint: '#B0C6FF',
        inverseSurface: '#E3E2E6',
        inverseOnSurface: '#1B1B1F',
        error: '#FFB4AB',
        onError: '#690005',
        errorContainer: '#93000A',
        onErrorContainer: '#FFDAD6',
        outline: '#8F9099',
        outlineVariant: '#44464F',
        scrim: '#000000',
        surfaceContainerLowest: '#1A181D',
        surfaceContainerLow: '#1E1C22',
        surfaceContainer: '#211F26',
        surfaceContainerHigh: '#292730',
        surfaceContainerHighest: '#302E38',
    },
};

/**
 * Mihon's AMOLED overrides (BaseColorScheme.kt).
 * The containers can't be pure black, because content scrolls behind e.g. the navigation bar.
 */
export const PURE_BLACK_OVERRIDES: Partial<M3ColorRoles> = {
    background: '#000000',
    onBackground: '#FFFFFF',
    surface: '#000000',
    onSurface: '#FFFFFF',
    surfaceVariant: '#0C0C0C',
    surfaceContainerLowest: '#0C0C0C',
    surfaceContainerLow: '#0C0C0C',
    surfaceContainer: '#0C0C0C',
    surfaceContainerHigh: '#131313',
    surfaceContainerHighest: '#1B1B1B',
};

/**
 * Tint of active filter icons (presentation-core Color.kt).
 */
export const ACTIVE_COLOR: Record<M3Mode, string> = {
    light: '#FFC107',
    dark: '#FFEB3B',
};

export const COVER_PLACEHOLDER_COLOR = 'rgba(136, 136, 136, 0.12)';

/**
 * Alpha of secondary text (Mihon "secondaryItemAlpha").
 */
export const SECONDARY_ALPHA = 0.78;

/**
 * Alpha of read items and disabled content.
 */
export const DISABLED_ALPHA = 0.38;

/**
 * Alpha of the container of disabled filled components, applied to "onSurface".
 */
export const DISABLED_CONTAINER_ALPHA = 0.12;

/**
 * Alphas of M3 state layers, applied to the content color.
 */
export const M3_STATE_LAYER_ALPHA = {
    hover: 0.08,
    focus: 0.1,
    pressed: 0.1,
    dragged: 0.16,
} as const;

export const SCRIM_ALPHA = 0.32;

/**
 * The Home Screen app draws the iOS status bar's white text over the page ("black-translucent"); in light themes a
 * scrim of this alpha behind it keeps the text readable (about 4:1 on the light surface).
 */
export const STATUS_BAR_SCRIM_ALPHA = 0.5;
