/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * The M3 Expressive shape scale. "theme.shape.borderRadius" stays 4 so numeric "borderRadius" multipliers keep their
 * meaning; use these strings for M3 shapes instead.
 */
export const M3_SHAPE = {
    none: '0',
    extraSmall: '4px',
    small: '8px',
    medium: '12px',
    large: '16px',
    largeIncreased: '20px',
    extraLarge: '28px',
    extraLargeIncreased: '32px',
    extraExtraLarge: '48px',
    full: '9999px',
} as const;

export const MUI_BORDER_RADIUS = 4;
