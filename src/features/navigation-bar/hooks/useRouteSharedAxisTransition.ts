/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { M3_DURATION, M3_EASING } from '@/features/theme/m3/M3Motion.constants.ts';

const SHARED_AXIS_OFFSET_PX = 30;
/**
 * The incoming screen fades in over the last 65 % of the slide (Material's shared axis).
 */
const SHARED_AXIS_FADE_IN_START = 0.35;

/**
 * Mihon's screen transition (materialSharedAxisX) when a nested route opens or closes: the new screen slides in by
 * 30 px, from the end on forward navigation and from the start on back navigation, while it fades in.
 *
 * It animates "left" (the container is relatively positioned), not a transform: a transform would make the container
 * the containing block of the screen's fixed elements (FABs, bars) while it plays. Home tab switches have their own
 * fade through (see "useHomeTabFadeThrough"), redirects don't animate.
 */
export const useRouteSharedAxisTransition = (container: RefObject<HTMLElement | null>, homeTabKey: string) => {
    const { pathname } = useLocation();
    const navigationType = useNavigationType();
    const isRtl = useTheme().direction === 'rtl';
    const previousRef = useRef({ pathname, homeTabKey });

    useLayoutEffect(() => {
        const previous = previousRef.current;
        previousRef.current = { pathname, homeTabKey };

        const isNestedNavigation = pathname !== previous.pathname && homeTabKey === previous.homeTabKey;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (
            !container.current ||
            !isNestedNavigation ||
            navigationType === NavigationType.Replace ||
            prefersReducedMotion
        ) {
            return;
        }

        const isBack = navigationType === NavigationType.Pop;
        const offset = SHARED_AXIS_OFFSET_PX * (isBack ? -1 : 1) * (isRtl ? -1 : 1);

        container.current.animate(
            [
                { left: `${offset}px`, opacity: 0 },
                { opacity: 0, offset: SHARED_AXIS_FADE_IN_START },
                { left: '0px', opacity: 1 },
            ],
            { duration: M3_DURATION.medium2, easing: M3_EASING.emphasizedDecelerate },
        );
    }, [pathname, homeTabKey]);
};
