/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

export type PillVariant = 'surface' | 'onSurface';

/**
 * Mihon's pill text sizes next to an app bar title and in tab labels.
 */
export const PILL_FONT_SIZE = { title: 14, tab: 10 } as const;

/**
 * Mihon's "Pill": a rounded count next to a title (e.g. the library's category tabs and app bar title).
 *
 * - surface: surfaceContainerHigh background (Mihon's default)
 * - onSurface: translucent onSurface background, for pills on colored or selected backgrounds
 *
 * The text style is inherited; "fontSize" overrides only its size (Mihon: 14 in titles, 10 in tab labels).
 */
export const Pill = ({
    children,
    variant = 'surface',
    fontSize,
    sx,
}: {
    children: ReactNode;
    variant?: PillVariant;
    fontSize?: number;
    sx?: SxProps<Theme>;
}) => (
    <Box
        component="span"
        sx={MUIUtil.mergeSx(
            {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginInlineStart: '4px',
                px: '6px',
                py: '1px',
                borderRadius: M3_SHAPE.full,
                whiteSpace: 'nowrap',
                fontSize,
                bgcolor: variant === 'surface' ? 'm3.surfaceContainerHigh' : 'm3.pillOnSurface',
                color: 'm3.onSurface',
            },
            sx,
        )}
    >
        {children}
    </Box>
);
