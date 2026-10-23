/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { PaletteOptions } from '@mui/material/styles';
import { hsl, mix, parseToHsl, rgba } from 'polished';
import type { M3ColorRoles, M3Mode, M3Palette } from '@/features/theme/m3/M3.types.ts';
import {
    ACTIVE_COLOR,
    COVER_PLACEHOLDER_COLOR,
    DISABLED_ALPHA,
    M3_STATE_LAYER_ALPHA,
    MIHON_DEFAULT_COLORS,
    PURE_BLACK_OVERRIDES,
    SECONDARY_ALPHA,
    DISABLED_CONTAINER_ALPHA,
} from '@/features/theme/m3/M3Color.constants.ts';

type Tone = (tone: number) => string;

const MAX_PRIMARY_SATURATION = 0.9;
const MAX_SECONDARY_SATURATION = 0.25;
const MAX_TERTIARY_SATURATION = 0.4;
const MAX_NEUTRAL_SATURATION = 0.06;
const MAX_NEUTRAL_VARIANT_SATURATION = 0.12;
const TERTIARY_HUE_ROTATION = 60;

/**
 * Approximates an M3 tonal palette (tone 0 = black, 100 = white) with HSL lightness.
 *
 * The exact HCT based palettes need "@material/material-color-utilities"; the default theme uses Mihon's tables and
 * never goes through this.
 */
const createTonalPalette = (hue: number, saturation: number): Tone => {
    const normalizedHue = ((hue % 360) + 360) % 360;

    return (tone) => hsl(normalizedHue, saturation, tone / 100);
};

/**
 * Tones of the "main", "on main", "container" and "on container" roles of the primary, secondary and tertiary families.
 */
const FAMILY_TONES: Record<M3Mode, { main: number; onMain: number; container: number; onContainer: number }> = {
    light: { main: 40, onMain: 100, container: 90, onContainer: 10 },
    dark: { main: 80, onMain: 20, container: 30, onContainer: 90 },
};

const createSeededColorRoles = (seed: string, tertiarySeed: string | undefined, mode: M3Mode): M3ColorRoles => {
    const seedHsl = parseToHsl(seed);
    const tertiaryHsl = tertiarySeed ? parseToHsl(tertiarySeed) : undefined;
    const isLight = mode === 'light';

    const primary = createTonalPalette(seedHsl.hue, Math.min(seedHsl.saturation, MAX_PRIMARY_SATURATION));
    const secondary = createTonalPalette(seedHsl.hue, Math.min(seedHsl.saturation, MAX_SECONDARY_SATURATION));
    const tertiary = tertiaryHsl
        ? createTonalPalette(tertiaryHsl.hue, Math.min(tertiaryHsl.saturation, MAX_PRIMARY_SATURATION))
        : createTonalPalette(
              seedHsl.hue + TERTIARY_HUE_ROTATION,
              Math.min(seedHsl.saturation, MAX_TERTIARY_SATURATION),
          );
    const neutral = createTonalPalette(seedHsl.hue, Math.min(seedHsl.saturation, MAX_NEUTRAL_SATURATION));
    const neutralVariant = createTonalPalette(
        seedHsl.hue,
        Math.min(seedHsl.saturation, MAX_NEUTRAL_VARIANT_SATURATION),
    );

    const { error, onError, errorContainer, onErrorContainer, scrim } = MIHON_DEFAULT_COLORS[mode];

    const tones = FAMILY_TONES[mode];

    return {
        primary: primary(tones.main),
        onPrimary: primary(tones.onMain),
        primaryContainer: primary(tones.container),
        onPrimaryContainer: primary(tones.onContainer),
        secondary: secondary(tones.main),
        onSecondary: secondary(tones.onMain),
        secondaryContainer: secondary(tones.container),
        onSecondaryContainer: secondary(tones.onContainer),
        tertiary: tertiary(tones.main),
        onTertiary: tertiary(tones.onMain),
        tertiaryContainer: tertiary(tones.container),
        onTertiaryContainer: tertiary(tones.onContainer),
        inversePrimary: primary(isLight ? 80 : 40),
        background: neutral(isLight ? 98 : 6),
        onBackground: neutral(isLight ? 10 : 90),
        surface: neutral(isLight ? 98 : 6),
        onSurface: neutral(isLight ? 10 : 90),
        surfaceVariant: neutralVariant(isLight ? 90 : 30),
        onSurfaceVariant: neutralVariant(isLight ? 30 : 80),
        surfaceTint: primary(isLight ? 40 : 80),
        inverseSurface: neutral(isLight ? 20 : 90),
        inverseOnSurface: neutral(isLight ? 95 : 20),
        error,
        onError,
        errorContainer,
        onErrorContainer,
        outline: neutralVariant(isLight ? 50 : 60),
        outlineVariant: neutralVariant(isLight ? 80 : 30),
        scrim,
        surfaceContainerLowest: neutral(isLight ? 100 : 4),
        surfaceContainerLow: neutral(isLight ? 96 : 10),
        surfaceContainer: neutral(isLight ? 94 : 12),
        surfaceContainerHigh: neutral(isLight ? 92 : 17),
        surfaceContainerHighest: neutral(isLight ? 90 : 22),
    };
};

/**
 * The tonal elevation overlay of Compose's "surfaceColorAtElevation".
 */
export const surfaceAtElevation = (palette: Pick<M3ColorRoles, 'surface' | 'surfaceTint'>, dp: number): string => {
    if (dp <= 0) {
        return palette.surface;
    }

    const tintAlpha = (4.5 * Math.log(dp + 1) + 2) / 100;

    return mix(tintAlpha, palette.surfaceTint, palette.surface);
};

/**
 * Applies an M3 state layer (e.g. hover) of the content color on top of a container color.
 */
export const applyStateLayer = (container: string, content: string, alpha: number): string =>
    mix(alpha, content, container);

const withExtraColors = (roles: M3ColorRoles, mode: M3Mode): M3Palette => {
    const isLight = mode === 'light';
    const elevation3 = surfaceAtElevation(roles, 3);

    return {
        ...roles,
        active: ACTIVE_COLOR[mode],
        surfaceAtElevation3: elevation3,
        readerBar: rgba(elevation3, isLight ? 0.95 : 0.9),
        selected: rgba(roles.secondary, isLight ? 0.22 : 0.16),
        coverPlaceholder: COVER_PLACEHOLDER_COLOR,
        pillOnSurface: rgba(roles.onBackground, isLight ? 0.08 : 0.12),
        // the error roles are the same for every scheme, the inverse surface takes the error color of the other mode
        inverseError: MIHON_DEFAULT_COLORS[isLight ? 'dark' : 'light'].error,
    };
};

export type CreateM3PaletteOptions = {
    /**
     * The color the scheme gets generated from. Without a seed, Mihon's default scheme is used.
     */
    seed?: string;
    /**
     * Seeds the tertiary family (a theme's "secondary" color).
     */
    tertiarySeed?: string;
    /**
     * A theme's own background, which replaces the "background" and "surface" roles.
     */
    backgroundOverride?: string;
    mode: M3Mode;
    pureBlack: boolean;
};

export const createM3Palette = ({
    seed,
    tertiarySeed,
    backgroundOverride,
    mode,
    pureBlack,
}: CreateM3PaletteOptions): M3Palette => {
    const roles: M3ColorRoles = seed
        ? createSeededColorRoles(seed, tertiarySeed, mode)
        : { ...MIHON_DEFAULT_COLORS[mode] };

    if (backgroundOverride) {
        roles.background = backgroundOverride;
        roles.surface = backgroundOverride;
    }

    const shouldUsePureBlack = pureBlack && mode === 'dark';

    return withExtraColors(shouldUsePureBlack ? { ...roles, ...PURE_BLACK_OVERRIDES } : roles, mode);
};

const toPaletteColor = (main: string, contrastText: string) => ({ main, light: main, dark: main, contrastText });

/**
 * Maps the M3 roles onto MUI's palette keys, so that unmodified MUI components and existing code pick up the scheme.
 */
export const createMuiPaletteFromM3 = (m3: M3Palette, mode: M3Mode): PaletteOptions => {
    const isLight = mode === 'light';
    const selectedOpacity = isLight ? 0.22 : 0.16;

    return {
        mode,
        m3,
        primary: toPaletteColor(m3.primary, m3.onPrimary),
        secondary: toPaletteColor(m3.secondary, m3.onSecondary),
        error: toPaletteColor(m3.error, m3.onError),
        success: toPaletteColor(m3.tertiary, m3.onTertiary),
        info: toPaletteColor(m3.primary, m3.onPrimary),
        warning: toPaletteColor(m3.active, '#000000'),
        background: {
            default: m3.surface,
            paper: m3.surfaceContainerLow,
        },
        text: {
            primary: m3.onSurface,
            secondary: rgba(m3.onSurface, SECONDARY_ALPHA),
            disabled: rgba(m3.onSurface, DISABLED_ALPHA),
        },
        action: {
            active: m3.onSurfaceVariant,
            hover: rgba(m3.onSurface, M3_STATE_LAYER_ALPHA.hover),
            hoverOpacity: M3_STATE_LAYER_ALPHA.hover,
            selected: m3.selected,
            selectedOpacity,
            focus: rgba(m3.onSurface, M3_STATE_LAYER_ALPHA.focus),
            focusOpacity: M3_STATE_LAYER_ALPHA.focus,
            activatedOpacity: M3_STATE_LAYER_ALPHA.pressed,
            disabled: rgba(m3.onSurface, DISABLED_ALPHA),
            disabledBackground: rgba(m3.onSurface, DISABLED_CONTAINER_ALPHA),
            disabledOpacity: DISABLED_ALPHA,
        },
        divider: m3.outlineVariant,
    };
};
