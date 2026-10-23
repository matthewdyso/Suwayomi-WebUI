/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * M3 outlined card of a migration destination or match.
 */
export const MigrationEntryCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.m3.surface,
    border: `1px solid ${theme.palette.m3.outlineVariant}`,
    borderRadius: M3_SHAPE.medium,
    boxShadow: 'none',
}));
