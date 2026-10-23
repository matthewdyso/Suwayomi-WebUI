/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CSSObject } from '@mui/material/styles';
import { M3_DURATION, M3_EASING } from '@/features/theme/m3/M3Motion.constants.ts';

export type ReaderBarEdge = 'top' | 'bottom' | 'left' | 'right';

const EDGE_TO_HIDDEN_TRANSFORM: Record<ReaderBarEdge, string> = {
    top: 'translateY(-100%)',
    bottom: 'translateY(100%)',
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
};

const SLIDE_DURATION = M3_DURATION.short4;
const FADE_DURATION = M3_DURATION.short3;

/**
 * Mihon's reader bars ("ReaderAppBars.kt") slide in from their edge (200 ms) while fading in (150 ms), standard easing.
 *
 * Hidden bars stay mounted, so their size can still be measured; they turn invisible once they slid out, which also
 * keeps them out of the tab order and lets taps reach the page.
 */
export const getReaderBarVisibilitySx = (isVisible: boolean, edge: ReaderBarEdge): CSSObject => ({
    transform: isVisible ? 'none' : EDGE_TO_HIDDEN_TRANSFORM[edge],
    opacity: isVisible ? 1 : 0,
    visibility: isVisible ? 'visible' : 'hidden',
    transition: [
        `transform ${SLIDE_DURATION}ms ${M3_EASING.standard}`,
        `opacity ${FADE_DURATION}ms ${M3_EASING.standard}`,
        `visibility 0ms linear ${isVisible ? 0 : SLIDE_DURATION}ms`,
    ].join(', '),
});

/**
 * Mihon's reader sheets (chapter list, reading mode, settings) take up to 75 % of the screen's height.
 */
export const READER_SHEET_MAX_HEIGHT = '75dvh';
