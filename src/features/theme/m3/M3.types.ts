/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CSSProperties } from 'react';

export type M3ColorRole =
    | 'primary'
    | 'onPrimary'
    | 'primaryContainer'
    | 'onPrimaryContainer'
    | 'inversePrimary'
    | 'secondary'
    | 'onSecondary'
    | 'secondaryContainer'
    | 'onSecondaryContainer'
    | 'tertiary'
    | 'onTertiary'
    | 'tertiaryContainer'
    | 'onTertiaryContainer'
    | 'background'
    | 'onBackground'
    | 'surface'
    | 'onSurface'
    | 'surfaceVariant'
    | 'onSurfaceVariant'
    | 'surfaceTint'
    | 'inverseSurface'
    | 'inverseOnSurface'
    | 'error'
    | 'onError'
    | 'errorContainer'
    | 'onErrorContainer'
    | 'outline'
    | 'outlineVariant'
    | 'scrim'
    | 'surfaceContainerLowest'
    | 'surfaceContainerLow'
    | 'surfaceContainer'
    | 'surfaceContainerHigh'
    | 'surfaceContainerHighest';

export type M3ColorRoles = Record<M3ColorRole, string>;

/**
 * Mihon specific colors that are not part of the M3 color roles.
 */
export type M3ExtraColor =
    | 'active'
    | 'surfaceAtElevation3'
    | 'readerBar'
    | 'selected'
    | 'coverPlaceholder'
    | 'pillOnSurface'
    | 'inverseError';

export type M3Palette = M3ColorRoles & Record<M3ExtraColor, string>;

export type M3Mode = 'light' | 'dark';

export type M3TypeScaleName =
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall';

export type M3TypeScaleEmphasizedName = `${M3TypeScaleName}Emphasized`;

/**
 * The typography variants the theme registers in addition to MUI's: the M3 type scale, its emphasized twins and Mihon's
 * "header" style.
 */
export type M3TypographyVariant = M3TypeScaleName | M3TypeScaleEmphasizedName | 'header';

/**
 * Sizes are in px (1 sp = 1 px).
 */
export type M3TypeStyle = {
    fontSize: number;
    lineHeight: number;
    fontWeight: number;
    letterSpacing: number;
};

export type M3TypographyStyle = Required<
    Pick<CSSProperties, 'fontFamily' | 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>
>;

export type M3Spring = {
    easing: string;
    duration: number;
};
