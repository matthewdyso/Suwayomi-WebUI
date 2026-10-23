/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ElementType } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * Mihon's collapsible section header (filter sheet groups, migration groups): the title and an expand arrow.
 */
export const CollapsibleHeader = ({
    title,
    expanded,
    onToggle,
    titleComponent = 'span',
    sx,
}: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    titleComponent?: ElementType;
    sx?: SxProps<Theme>;
}) => (
    <ButtonBase
        onClick={onToggle}
        aria-expanded={expanded}
        sx={MUIUtil.mergeSx(
            {
                // a block-level row, so it fills its parent including negative margins
                display: 'flex',
                justifyContent: 'space-between',
                gap: 2,
                minHeight: M3_LAYOUT.minTouchTarget,
                px: 2,
                color: 'm3.onSurfaceVariant',
                textAlign: 'start',
                ...m3StateLayerSx(),
            },
            sx,
        )}
    >
        <Typography variant="header" component={titleComponent}>
            {title}
        </Typography>
        {expanded ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
    </ButtonBase>
);
