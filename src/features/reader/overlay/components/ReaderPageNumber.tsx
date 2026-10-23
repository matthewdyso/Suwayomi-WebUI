/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { ProgressBarType } from '@/features/reader/Reader.types.ts';
import { getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import {
    useReaderPagesStore,
    useReaderProgressBarStore,
    useReaderScrollbarStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';

/**
 * Mihon's "ReaderPageIndicator" colors: light text with a dark outline, readable on any page, independent of the theme.
 */
const PAGE_INDICATOR_COLOR = {
    text: '#EBEBEB',
    outline: '#2D2D2D',
} as const;

/**
 * 1 px text shadows in all eight directions draw the outline (Mihon strokes the text).
 */
const PAGE_INDICATOR_OUTLINE = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
]
    .map(([x, y]) => `${x}px ${y}px 0 ${PAGE_INDICATOR_COLOR.outline}`)
    .join(', ');

const BaseReaderPageNumber = ({
    isDesktop,
    readerNavBarWidth,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop'> &
    Pick<NavbarContextType, 'readerNavBarWidth'>) => {
    const scrollbar = useReaderScrollbarStore((state) => state);
    const { currentPageIndex, pages, totalPages } = useReaderPagesStore('currentPageIndex', 'pages', 'totalPages');
    const { shouldShowPageNumber, progressBarType, progressBarSize } = useReaderSettingsStore((state) => ({
        shouldShowPageNumber: state.shouldShowPageNumber,
        progressBarType: state.progressBarType,
        progressBarSize: state.progressBarSize,
    }));
    const progressBarSizeInset = isDesktop && progressBarType === ProgressBarType.STANDARD ? progressBarSize : 0;
    const isMaximized = useReaderProgressBarStore('isMaximized');

    // Mihon's "ReaderPageIndicator" reads "current / total" in every reading direction
    const pageName = useMemo(
        () => `${getPage(currentPageIndex, pages).name} / ${totalPages}`,
        [currentPageIndex, pages, totalPages],
    );

    if (!shouldShowPageNumber) {
        return null;
    }

    if (isMaximized) {
        return null;
    }

    return (
        <Stack
            sx={{
                position: 'fixed',
                left: readerNavBarWidth,
                right: 0,
                // overlay chrome stays clear of the home indicator, whether the pages are inset or not
                bottom: (theme) =>
                    `calc(${theme.spacing(0.5)} + ${progressBarSizeInset}px + max(${scrollbar.xSize}px, env(safe-area-inset-bottom)))`,
                alignItems: 'center',
                transition: (theme) => `left 0.${theme.transitions.duration.shortest}s`,
            }}
        >
            <Typography
                variant="bodySmall"
                sx={{
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    color: PAGE_INDICATOR_COLOR.text,
                    textShadow: PAGE_INDICATOR_OUTLINE,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {pageName}
            </Typography>
        </Stack>
    );
};

export const ReaderPageNumber = withPropsFrom(
    BaseReaderPageNumber,
    [ReaderService.useOverlayMode, useNavBarContext],
    ['isDesktop', 'readerNavBarWidth'],
);
