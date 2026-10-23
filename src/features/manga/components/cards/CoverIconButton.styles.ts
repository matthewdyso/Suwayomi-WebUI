/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

export type CoverIconButtonSize = 'small' | 'large';

/**
 * Mihon's continue reading button: 32 px with a 20 px icon, 28 px with a 16 px icon in compact grids and lists.
 */
const COVER_ICON_BUTTON_SIZE: Record<CoverIconButtonSize, { button: number; icon: number }> = {
    small: { button: 28, icon: 16 },
    large: { button: 32, icon: 20 },
};

/**
 * Mihon keeps the cover slightly visible through the button.
 */
const COVER_ICON_BUTTON_ALPHA = 0.9;

/**
 * Mihon's "FilledIconButton" on covers (for a ButtonBase): primary container, or secondary container when "tonal".
 */
export const getCoverIconButtonSx = (size: CoverIconButtonSize, tonal: boolean = false): SxProps<Theme> => {
    const { button, icon } = COVER_ICON_BUTTON_SIZE[size];

    return {
        flexShrink: 0,
        width: button,
        height: button,
        borderRadius: M3_SHAPE.small,
        bgcolor: (theme) =>
            alpha(
                tonal ? theme.palette.m3.secondaryContainer : theme.palette.m3.primaryContainer,
                COVER_ICON_BUTTON_ALPHA,
            ),
        color: tonal ? 'm3.onSecondaryContainer' : 'm3.onPrimaryContainer',
        [`& .${svgIconClasses.root}`]: {
            fontSize: icon,
        },
        ...m3StateLayerSx(),
    };
};
