/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import { typographyClasses } from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { shouldForwardProp } from '@/base/utils/ShouldForwardProp.ts';
import { getListGroupHeaderStyle } from '@/base/components/lists/ListGroupHeader.tsx';

type StyledGroupHeaderProps = {
    /**
     * Kept for compatibility, Mihon's group headers look the same at the top of the list.
     */
    isFirstItem?: boolean;
};

/**
 * Sticky group header of the grouped virtuoso lists, in Mihon's "ListGroupHeader" style.
 */
export const StyledGroupHeader = styled(Stack, {
    shouldForwardProp: shouldForwardProp<StyledGroupHeaderProps>(['isFirstItem']),
})<StyledGroupHeaderProps & TypographyProps>(({ theme }) => ({
    ...getListGroupHeaderStyle(theme),
    backgroundColor: theme.palette.m3.surface,
    // the header text is passed as a heading Typography; it has to look like the header, not like a heading
    [`& .${typographyClasses.root}`]: {
        font: 'inherit',
        letterSpacing: 'inherit',
        color: 'inherit',
    },
}));
