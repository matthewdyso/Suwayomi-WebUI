/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { BoxProps } from '@mui/material/Box';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import type { SxProps, Theme } from '@mui/material/styles';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import type { M3ColorRole } from '@/features/theme/m3/M3.types.ts';

export type TextBadgeColor = 'secondary' | 'tertiary' | 'primary' | 'error';

const BADGE_COLORS: Record<TextBadgeColor, { bg: M3ColorRole; fg: M3ColorRole }> = {
    secondary: { bg: 'secondary', fg: 'onSecondary' },
    tertiary: { bg: 'tertiary', fg: 'onTertiary' },
    primary: { bg: 'primary', fg: 'onPrimary' },
    error: { bg: 'error', fg: 'onError' },
};

/**
 * Mihon's "Badge": square text (or icon) badge, e.g. unread and download counts on covers.
 *
 * Badges next to each other belong into a {@link TextBadgeGroup}, which rounds the group's outer corners.
 */
export const TextBadge = ({
    children,
    icon: Icon,
    color = 'secondary',
    sx,
}: {
    children?: ReactNode;
    /**
     * Rendered instead of the text, at the text's size.
     */
    icon?: OverridableComponent<SvgIconTypeMap>;
    color?: TextBadgeColor;
    sx?: SxProps<Theme>;
}) => (
    <Box
        component="span"
        sx={MUIUtil.mergeSx(
            {
                typography: 'bodySmall',
                display: 'inline-flex',
                alignItems: 'center',
                fontWeight: 500,
                lineHeight: '16px',
                px: '3px',
                py: '1px',
                whiteSpace: 'nowrap',
                bgcolor: `m3.${BADGE_COLORS[color].bg}`,
                color: `m3.${BADGE_COLORS[color].fg}`,
            },
            sx,
        )}
    >
        {Icon ? <Icon sx={{ fontSize: 'inherit' }} /> : children}
    </Box>
);

/**
 * Further props (e.g. role, aria-label, className) go to the group's element.
 */
export const TextBadgeGroup = ({ children, sx, ...props }: Omit<BoxProps<'span'>, 'component'>) => (
    <Box
        {...props}
        component="span"
        sx={MUIUtil.mergeSx(
            {
                display: 'inline-flex',
                borderRadius: M3_SHAPE.extraSmall,
                overflow: 'hidden',
            },
            sx,
        )}
    >
        {children}
    </Box>
);
