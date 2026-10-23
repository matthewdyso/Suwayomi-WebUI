/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton, { iconButtonClasses } from '@mui/material/IconButton';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import { memo, useLayoutEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { getProgressBarPositionInfo } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import type { ProgressBarPosition } from '@/features/reader/Reader.types.ts';
import { ReaderResumeMode } from '@/features/reader/Reader.types.ts';
import { ReaderProgressBarDirectionWrapper } from '@/features/reader/overlay/progress-bar/components/ReaderProgressBarDirectionWrapper.tsx';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import {
    getReaderProgressBarStore,
    useReaderChaptersStore,
    useReaderOverlayStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ReaderPageSliderPill } from '@/features/reader/overlay/progress-bar/components/ReaderPageSliderPill.tsx';

/**
 * Mihon's "FilledIconButton" in the bar color: the 40 px circle of the theme's IconButton gets the bar's background.
 */
const CHAPTER_BUTTON_SX = {
    bgcolor: 'm3.readerBar',
    color: 'm3.onSurface',
    [`&:hover, &.${iconButtonClasses.disabled}`]: {
        bgcolor: 'm3.readerBar',
    },
} as const;

/**
 * Mihon's "ChapterNavigator": previous and next chapter buttons around a pill with the page slider.
 *
 * Horizontally, its direction follows the reading direction; vertically, the first page is at the top.
 */
const BaseMobileReaderProgressBar = ({
    direction: readerDirection,
    progressBarPosition,
}: {
    direction: ReturnType<typeof ReaderService.useGetThemeDirection>;
    progressBarPosition: Exclude<ProgressBarPosition, ProgressBarPosition.AUTO>;
}) => {
    const { t } = useLingui();
    const isVisible = useReaderOverlayStore('isVisible');
    const { previousChapter, nextChapter } = useReaderChaptersStore('previousChapter', 'nextChapter');

    const { isVertical, isHorizontal } = getProgressBarPositionInfo(progressBarPosition);
    const finalReaderDirection = isHorizontal ? readerDirection : 'ltr';

    useLayoutEffect(() => {
        getReaderProgressBarStore().setIsMaximized(isVisible);

        return () => getReaderProgressBarStore().setIsMaximized(false);
    }, [isVisible]);

    const iconSx = isVertical ? { transform: 'rotate(90deg)' } : undefined;

    return (
        <ReaderProgressBarDirectionWrapper
            sx={{
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                alignItems: 'center',
                ...(isVertical ? { height: '100%', py: 1 } : { px: 1 }),
            }}
        >
            <IconButton
                aria-label={t`Previous chapter`}
                onClick={() => ReaderControls.openChapter('previous', { resumeMode: ReaderResumeMode.START })}
                disabled={!previousChapter}
                sx={CHAPTER_BUTTON_SX}
            >
                {getOptionForDirection(
                    <SkipPreviousRoundedIcon sx={iconSx} />,
                    <SkipNextRoundedIcon sx={iconSx} />,
                    finalReaderDirection,
                )}
            </IconButton>
            <ReaderPageSliderPill isVertical={isVertical} />
            <IconButton
                aria-label={t`Next chapter`}
                onClick={() => ReaderControls.openChapter('next', { resumeMode: ReaderResumeMode.START })}
                disabled={!nextChapter}
                sx={CHAPTER_BUTTON_SX}
            >
                {getOptionForDirection(
                    <SkipNextRoundedIcon sx={iconSx} />,
                    <SkipPreviousRoundedIcon sx={iconSx} />,
                    finalReaderDirection,
                )}
            </IconButton>
        </ReaderProgressBarDirectionWrapper>
    );
};

export const MobileReaderProgressBar = withPropsFrom(
    memo(BaseMobileReaderProgressBar),
    [() => ({ direction: ReaderService.useGetThemeDirection() })],
    ['direction'],
);
