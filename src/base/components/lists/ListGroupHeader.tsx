/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ElementType } from 'react';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import type { CSSObject, Theme } from '@mui/material/styles';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

/**
 * Mihon's "ListGroupHeader" text style (date groups of updates and history, language groups of browse).
 */
export const getListGroupHeaderStyle = (theme: Theme): CSSObject => ({
    ...theme.typography.bodyMedium,
    fontWeight: 600,
    color: theme.palette.m3.onSurfaceVariant,
    padding: theme.spacing(1, 2),
});

export const ListGroupHeader = ({
    sx,
    component = 'div',
    ...props
}: TypographyProps<'div', { component?: ElementType }>) => (
    <Typography {...props} component={component} sx={MUIUtil.mergeSx(getListGroupHeaderStyle, sx)} />
);
