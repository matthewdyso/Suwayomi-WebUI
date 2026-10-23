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

/**
 * - filter: Mihon's filter/sort chip rows (padding 8, gap 8)
 * - tags: Mihon's genre tags of the manga page (padding 16, gap 4)
 */
export type ChipRowVariant = 'filter' | 'tags';

const VARIANT_SPACING: Record<ChipRowVariant, { padding: number; gap: number }> = {
    filter: { padding: 1, gap: 1 },
    tags: { padding: 2, gap: 0.5 },
};

/**
 * A horizontally scrolling row of chips without a visible scrollbar, or with "wrap" a wrapping flow of chips.
 */
export const ChipRow = ({
    children,
    variant = 'filter',
    wrap = false,
    sx,
}: {
    children: ReactNode;
    variant?: ChipRowVariant;
    wrap?: boolean;
    sx?: SxProps<Theme>;
}) => {
    const { padding, gap } = VARIANT_SPACING[variant];

    return (
        <Box
            sx={MUIUtil.mergeSx(
                {
                    display: 'flex',
                    alignItems: 'center',
                    gap,
                    px: padding,
                    ...(wrap
                        ? { flexWrap: 'wrap' }
                        : {
                              flexWrap: 'nowrap',
                              overflowX: 'auto',
                              overscrollBehaviorX: 'contain',
                              scrollbarWidth: 'none',
                              '&::-webkit-scrollbar': { display: 'none' },
                              '& > *': { flexShrink: 0 },
                          }),
                },
                sx,
            )}
        >
            {children}
        </Box>
    );
};
