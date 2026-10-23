/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';

/**
 * Small scroll jitter (e.g. iOS rubber banding) must not toggle the FAB.
 */
const SCROLL_HYSTERESIS_PX = 8;

const getScrollTop = (scrollElement: HTMLElement | Window): number =>
    scrollElement instanceof HTMLElement ? scrollElement.scrollTop : scrollElement.scrollY;

/**
 * Mihon's extended FABs collapse to their icon while the user scrolls down and expand again when scrolling up or
 * reaching the top of the page.
 *
 * Follows the window's scroll position unless "scrollElement" is given, e.g. a list that scrolls on its own.
 */
export const useFabExpanded = (scrollElement?: HTMLElement | Window | null): boolean => {
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const target = scrollElement ?? window;
        let anchorY = getScrollTop(target);

        const handleScroll = () => {
            const scrollY = getScrollTop(target);

            if (scrollY <= 0) {
                anchorY = 0;
                setIsExpanded(true);
                return;
            }

            const delta = scrollY - anchorY;
            if (Math.abs(delta) < SCROLL_HYSTERESIS_PX) {
                return;
            }

            anchorY = scrollY;
            setIsExpanded(delta < 0);
        };

        target.addEventListener('scroll', handleScroll, { passive: true });

        return () => target.removeEventListener('scroll', handleScroll);
    }, [scrollElement]);

    return isExpanded;
};
