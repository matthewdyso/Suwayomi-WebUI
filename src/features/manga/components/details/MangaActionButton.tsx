/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import { svgIconClasses } from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { DISABLED_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * Mihon's "MangaActionButton": one of the equally wide icon-over-label text buttons below the manga info.
 *
 * Active buttons (in library, tracked, links) use the primary color, the others are dimmed.
 */
export const MangaActionButton = ({
    icon,
    label,
    active,
    sx,
    ...buttonProps
}: Omit<ButtonProps, 'children' | 'variant'> &
    // with an "href" the button is a link
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
        icon: ReactNode;
        label: string;
        active: boolean;
    }) => (
    <Button
        {...buttonProps}
        variant="text"
        sx={MUIUtil.mergeSx(
            {
                flex: '1 1 0',
                minWidth: 0,
                minHeight: 56,
                flexDirection: 'column',
                gap: 0.5,
                px: 0.5,
                py: 1,
                borderRadius: M3_SHAPE.medium,
                color: (theme) =>
                    active ? theme.palette.m3.primary : alpha(theme.palette.m3.onSurface, DISABLED_ALPHA),
                [`& .${svgIconClasses.root}`]: { fontSize: 20 },
            },
            sx,
        )}
    >
        {icon}
        <Typography variant="labelMedium" component="span" sx={{ textAlign: 'center', overflowWrap: 'anywhere' }}>
            {label}
        </Typography>
    </Button>
);
