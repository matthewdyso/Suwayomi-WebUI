/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { useMainRoutePath } from '@/features/navigation-bar/hooks/useMainRoutePath.ts';
import { M3_EASING } from '@/features/theme/m3/M3Motion.constants.ts';

const FADE_THROUGH_IN_DURATION = 210;

const fadeThroughIn = keyframes`
    from {
        opacity: 0;
        transform: scale(0.92);
    }
`;

const FADE_THROUGH_SX: CSSObject = {
    '@media (prefers-reduced-motion: no-preference)': {
        animation: `${fadeThroughIn} ${FADE_THROUGH_IN_DURATION}ms ${M3_EASING.emphasizedDecelerate}`,
        // the new tab starts at the top of the page, scale it around the center of the viewport instead of the page
        transformOrigin: '50% 50vh',
    },
};

const NO_FADE_THROUGH_SX: CSSObject = {};

/**
 * Mihon's "fade through" between navigation destinations (home tabs), for the element that contains the routes:
 * changing its key on a tab switch remounts it, which plays the incoming animation.
 *
 * Nested routes and returning from them to the same tab keep the key, so they don't animate; neither does the first
 * destination after the app opened.
 *
 * The scale makes the animated element the containing block of "position: fixed" descendants while it plays: home
 * tabs must not render fixed elements (FABs, bars) on mount, or those move with the page for its duration.
 */
export const useHomeTabFadeThrough = (): { key: string; sx: CSSObject } => {
    const mainRoutePath = useMainRoutePath();
    const [shownTab, setShownTab] = useState({ path: mainRoutePath, isSwitch: false });

    if (mainRoutePath !== null && mainRoutePath !== shownTab.path) {
        setShownTab({ path: mainRoutePath, isSwitch: shownTab.path !== null || shownTab.isSwitch });
    }

    return {
        key: shownTab.path ?? '',
        sx: shownTab.isSwitch ? FADE_THROUGH_SX : NO_FADE_THROUGH_SX,
    };
};
