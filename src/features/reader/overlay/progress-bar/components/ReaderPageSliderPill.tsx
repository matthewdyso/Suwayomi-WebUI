/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { getIndexOfPage, getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { useReaderPagesStore } from '@/features/reader/stores/ReaderStore.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';
import type { M3Palette } from '@/features/theme/m3/M3.types.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * The pill's padding along the slider; the page numbers reach into it to get their touch target.
 */
const PILL_PADDING_PX = 16;

const getPillSx =
    (isVertical: boolean, containerColor: keyof M3Palette) =>
    (theme: Theme): CSSObject => ({
        [M3_CSS_VARIABLE.sliderGapColor]: theme.palette.m3[containerColor],
        display: 'flex',
        flexGrow: 1,
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        minWidth: 0,
        minHeight: 0,
        borderRadius: '24px',
        backgroundColor: theme.palette.m3[containerColor],
        color: theme.palette.m3.onSurface,
        ...(isVertical
            ? { width: 48, padding: `${PILL_PADDING_PX}px 0` }
            : { height: 48, padding: `0 ${PILL_PADDING_PX}px` }),
    });

/**
 * A page number that turns to the previous or next page (upstream's progress bar did that, Mihon's numbers are plain
 * text). Its touch target is 48 px: across the pill, and from the pill's end (its padding) towards the slider, so a
 * tap at the slider's first or last position still reaches the slider.
 *
 * With "widestText", it keeps the width of the widest page number, so the slider next to it doesn't move while paging
 * (Mihon measures the widest text): both share one grid cell, the widest one invisible, the number at the end of the
 * cell next to the slider (Mihon's "CenterEnd"; centered above a vertical slider).
 */
const PageNumber = ({
    text,
    widestText,
    isVertical,
    edge,
    label,
    onClick,
}: {
    text: string;
    widestText?: string;
    isVertical: boolean;
    edge: 'start' | 'end';
    label: string;
    onClick: () => void;
}) => {
    // the number sits next to the slider
    const towardsSlider = edge === 'start' ? 'end' : 'start';

    return (
        <ButtonBase
            aria-label={label}
            onClick={onClick}
            focusRipple
            sx={{
                display: 'inline-grid',
                justifyContent: isVertical ? 'center' : towardsSlider,
                justifyItems: isVertical ? 'center' : towardsSlider,
                alignContent: isVertical ? towardsSlider : 'center',
                alignSelf: 'stretch',
                flexShrink: 0,
                minWidth: 48,
                minHeight: 48,
                [isVertical
                    ? `margin${edge === 'start' ? 'Top' : 'Bottom'}`
                    : `marginInline${edge === 'start' ? 'Start' : 'End'}`]: `-${PILL_PADDING_PX}px`,
                borderRadius: M3_SHAPE.full,
                typography: 'bodyLarge',
                fontVariantNumeric: 'tabular-nums',
            }}
        >
            <Box component="span" sx={{ gridArea: '1 / 1' }}>
                {text}
            </Box>
            {widestText && (
                <Box component="span" aria-hidden sx={{ gridArea: '1 / 1', visibility: 'hidden' }}>
                    {widestText}
                </Box>
            )}
        </ButtonBase>
    );
};

/**
 * The pill of Mihon's "ChapterNavigator": current page, page slider and total pages.
 *
 * Without pages to choose from, Mihon draws only a spacer in its place. The direction follows the surrounding
 * "ReaderProgressBarDirectionWrapper".
 */
export const ReaderPageSliderPill = ({
    isVertical = false,
    containerColor = 'readerBar',
}: {
    isVertical?: boolean;
    containerColor?: keyof M3Palette;
}) => {
    const { t } = useLingui();
    const { currentPageIndex, pages, totalPages } = useReaderPagesStore('currentPageIndex', 'pages', 'totalPages');

    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    // double page mode names its pages "3-4"
    const widestPageName = pages.some(({ secondary }) => !!secondary) ? `${totalPages}-${totalPages}` : `${totalPages}`;
    const lastPagesIndex = pages.length - 1;
    // a vertical slider has its minimum at the bottom, the first page has to be at the top
    const toSliderValue = (pagesIndex: number) => (isVertical ? lastPagesIndex - pagesIndex : pagesIndex);

    if (pages.length <= 1) {
        return <Box sx={{ flexGrow: 1 }} />;
    }

    return (
        <Stack sx={getPillSx(isVertical, containerColor)}>
            <PageNumber
                text={currentPage.name}
                widestText={widestPageName}
                isVertical={isVertical}
                edge="start"
                label={t`Previous page`}
                onClick={() => ReaderControls.openPage('previous', 'ltr', false)}
            />
            <Slider
                aria-label={t`Page`}
                orientation={isVertical ? 'vertical' : 'horizontal'}
                track={isVertical ? 'inverted' : 'normal'}
                min={0}
                max={lastPagesIndex}
                step={1}
                marks
                value={toSliderValue(Math.max(0, currentPage.pagesIndex))}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => pages[toSliderValue(value)].name}
                onChange={(_, value) =>
                    ReaderControls.openPage(getIndexOfPage(pages[toSliderValue(value)]), undefined, false)
                }
                sx={{ flexGrow: 1, ...(isVertical ? { my: 1 } : { mx: 1 }) }}
            />
            <PageNumber
                text={`${totalPages}`}
                isVertical={isVertical}
                edge="end"
                label={t`Next page`}
                onClick={() => ReaderControls.openPage('next', 'ltr', false)}
            />
        </Stack>
    );
};
