/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { M3ColorRole } from '@/features/theme/m3/M3.types.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * Mihon tints the pill's background with its text color at this alpha.
 */
const PILL_BACKGROUND_ALPHA = 0.12;

/**
 * Mihon's "ExtensionPill": a small label for the notable facts of an extension (obsolete, 18+, installing).
 */
export const ExtensionPill = ({
    children,
    color = 'onSurfaceVariant',
}: {
    children: ReactNode;
    color?: M3ColorRole;
}) => (
    <Typography
        variant="labelSmall"
        component="span"
        sx={(theme) => ({
            display: 'inline-block',
            px: 1,
            py: '2px',
            borderRadius: M3_SHAPE.small,
            color: theme.palette.m3[color],
            backgroundColor: alpha(theme.palette.m3[color], PILL_BACKGROUND_ALPHA),
            whiteSpace: 'nowrap',
        })}
    >
        {children}
    </Typography>
);
