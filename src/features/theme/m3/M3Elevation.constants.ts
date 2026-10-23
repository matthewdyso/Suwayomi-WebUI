/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Shadows } from '@mui/material/styles';

/**
 * M3 shadows; M3 separates surfaces with tonal colors first and uses shadows rarely (menus, FABs, dragged items).
 */
export const M3_ELEVATION = {
    level0: 'none',
    level1: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
    level2: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
    level3: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
    level4: '0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15)',
    level5: '0 4px 4px 0 rgba(0, 0, 0, 0.3), 0 8px 12px 6px rgba(0, 0, 0, 0.15)',
} as const;

/**
 * A list item while it is dragged: it lifts like Mihon's, on a neutral surfaceContainerHigh instead of Material's
 * tinted surface, at elevation level 2.
 */
export const M3_DRAGGED_ITEM_SX = {
    bgcolor: 'm3.surfaceContainerHigh',
    boxShadow: M3_ELEVATION.level2,
} as const;

const getShadowOfMuiElevation = (elevation: number): string => {
    if (elevation === 0) {
        return M3_ELEVATION.level0;
    }

    if (elevation <= 2) {
        return M3_ELEVATION.level1;
    }

    if (elevation <= 5) {
        return M3_ELEVATION.level2;
    }

    if (elevation <= 7) {
        return M3_ELEVATION.level3;
    }

    if (elevation <= 11) {
        return M3_ELEVATION.level4;
    }

    return M3_ELEVATION.level5;
};

const MUI_ELEVATION_COUNT = 25;

/**
 * MUI's 25 elevations mapped onto the five M3 levels.
 */
export const M3_SHADOWS = Array.from({ length: MUI_ELEVATION_COUNT }, (_, elevation) =>
    getShadowOfMuiElevation(elevation),
) as Shadows;
