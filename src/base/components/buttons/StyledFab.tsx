/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Fab from '@mui/material/Fab';
import { styled } from '@mui/material/styles';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * Bottom right, 16 px above the navigation bar while it's shown, otherwise above the home indicator.
 */
export const DEFAULT_FAB_STYLE = {
    position: 'fixed',
    height: '56px',
    right: 'calc(16px + env(safe-area-inset-right))',
    bottom: `calc(max(var(${M3_CSS_VARIABLE.bottomBarHeight}, 0px), env(safe-area-inset-bottom)) + 16px)`,
} as const;

/**
 * Bottom padding that keeps the end of a scrolling list clear of the FAB. The main container already pads the
 * navigation bar and the home indicator.
 */
export const DEFAULT_FULL_FAB_HEIGHT = `calc(16px + ${DEFAULT_FAB_STYLE.height} + 16px)`;

export const StyledFab = styled(Fab)({
    ...DEFAULT_FAB_STYLE,
}) as typeof Fab;
