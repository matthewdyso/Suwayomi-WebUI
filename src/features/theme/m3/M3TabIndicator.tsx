/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { touchRippleClasses } from '@mui/material/ButtonBase';
import { useMergedRef } from '@mantine/hooks';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';

const MIN_INDICATOR_WIDTH = 24;

/**
 * Until the tabs are mounted, MUI renders the indicator inside the selected tab, afterwards next to the tabs.
 */
const getSelectedTab = (indicator: HTMLElement): Element | null =>
    indicator.closest('[role="tab"]') ??
    indicator.parentElement?.querySelector('[role="tab"][aria-selected="true"]') ??
    null;

/**
 * Vertical tabs keep a full-height indicator.
 */
const isInVerticalTabs = (indicator: HTMLElement): boolean => !!indicator.closest('[aria-orientation="vertical"]');

/**
 * The width of the tab's content (icon and label), without its ripple and the indicator itself.
 */
const getTabContentWidth = (tab: Element, indicator: Element): number => {
    const contentNodes = Array.from(tab.childNodes).filter(
        (node) => node !== indicator && !(node instanceof Element && node.classList.contains(touchRippleClasses.root)),
    );

    if (!contentNodes.length) {
        return 0;
    }

    const range = document.createRange();
    range.setStartBefore(contentNodes[0]);
    range.setEndAfter(contentNodes[contentNodes.length - 1]);

    // client rects include transforms (e.g. the home tabs' fade-through scale), the indicator needs the layout width
    const tabRectWidth = tab.getBoundingClientRect().width;
    const scale = tab instanceof HTMLElement && tabRectWidth ? tabRectWidth / tab.offsetWidth : 1;

    return range.getBoundingClientRect().width / scale;
};

/**
 * Below this difference in px a new measurement keeps the current width, so measuring can't re-render endlessly.
 */
const WIDTH_TOLERANCE = 0.5;

/**
 * M3's primary tab indicator (Mihon's "PrimaryTabRow"): as wide as the selected tab's label (at least 24 px), not as
 * the whole tab.
 *
 * Rendered by the "indicator" slot of MUI's Tabs, which positions it under the selected tab and slides it between
 * tabs; the bar inside it takes the width of the label.
 */
export const M3TabIndicator = ({ ref, ...indicatorProps }: ComponentProps<'span'>) => {
    const indicatorRef = useRef<HTMLSpanElement>(null);
    const mergedRef = useMergedRef(ref, indicatorRef);
    const [contentWidth, setContentWidth] = useState<number>();

    // MUI re-renders the indicator whenever the selected tab, its label or its size changes
    useLayoutEffect(() => {
        const indicator = indicatorRef.current;
        const tab = indicator && !isInVerticalTabs(indicator) ? getSelectedTab(indicator) : null;

        const width = indicator && tab ? getTabContentWidth(tab, indicator) : undefined;

        setContentWidth((currentWidth) =>
            width !== undefined && currentWidth !== undefined && Math.abs(width - currentWidth) < WIDTH_TOLERANCE
                ? currentWidth
                : width,
        );
    });

    return (
        // MUI's indicator props: its classes and the position it computes from the selected tab
        <span {...indicatorProps} ref={mergedRef}>
            <Box
                component="span"
                sx={{
                    width: contentWidth ?? '100%',
                    minWidth: contentWidth === undefined ? undefined : MIN_INDICATOR_WIDTH,
                    height: '100%',
                    borderRadius: '3px 3px 0 0',
                    bgcolor: 'm3.primary',
                    transition: m3Transition(['width'], M3_SPRING.defaultSpatial),
                }}
            />
        </span>
    );
};
