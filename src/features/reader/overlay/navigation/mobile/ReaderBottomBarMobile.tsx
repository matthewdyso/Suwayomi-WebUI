/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { IconButtonProps } from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { AdaptiveSheet } from '@/base/components/modals/AdaptiveSheet.tsx';
import type { ReaderBottomBarMobileProps } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { MobileReaderProgressBar } from '@/features/reader/overlay/progress-bar/mobile/MobileReaderProgressBar.tsx';
import { ReaderChapterList } from '@/features/reader/overlay/navigation/components/ReaderChapterList.tsx';
import { ReaderBottomBarMobileQuickSettings } from '@/features/reader/overlay/navigation/mobile/quick-settings/ReaderBottomBarMobileQuickSettings.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import {
    useReaderChaptersStore,
    useReaderScrollbarStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { getProgressBarPosition } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import { getProgressBarPositionInfo } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { getReaderBarVisibilitySx, READER_SHEET_MAX_HEIGHT } from '@/features/reader/overlay/ReaderOverlay.utils.ts';
import { READING_MODE_VALUE_TO_DISPLAY_DATA } from '@/features/reader/settings/ReaderSettings.constants.tsx';

/**
 * Mihon's vertical navigator ("pref_vertical_navigator_height" default) takes 65 % of the space between the bars.
 */
const VERTICAL_NAVIGATOR_HEIGHT = '65%';

/**
 * Focus returns to these buttons when their sheet closes; a focus tooltip would then cover the chapter navigator.
 */
const ReaderBottomBarButton = ({ title, ...props }: Omit<IconButtonProps, 'color'> & { title: string }) => (
    <CustomTooltip title={title} disableFocusListener>
        <IconButton {...props} color="inherit" />
    </CustomTooltip>
);

/**
 * Mihon's "ReaderAppBars" bottom part: the chapter navigator above the bottom bar, or a vertical navigator at the
 * side of the screen.
 */
const BaseReaderBottomBarMobile = ({
    openSettings,
    isVisible,
    topOffset = 0,
}: ReaderBottomBarMobileProps & { topOffset?: number }) => {
    const { t } = useLingui();
    const { currentChapterId, chapters } = useReaderChaptersStore((state) => ({
        currentChapterId: state.currentChapter?.id,
        chapters: state.chapters,
    }));
    const { readingMode, progressBarPosition, progressBarPositionAutoVertical } = useReaderSettingsStore(
        'readingMode',
        'progressBarPosition',
        'progressBarPositionAutoVertical',
    );

    const chapterListPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-chapter-list-dialog' });
    const quickSettingsPopupState = usePopupState({ variant: 'dialog', popupId: 'reader-quick-settings-dialog' });
    const scrollbar = useReaderScrollbarStore((state) => state);

    const [bottomBarHeight, setBottomBarHeight] = useState(0);
    const bottomBarRef = useRef<HTMLDivElement>(null);
    useResizeObserver(
        bottomBarRef,
        useCallback(() => setBottomBarHeight(bottomBarRef.current?.clientHeight ?? 0), []),
    );

    // the automatic position depends on the window's aspect ratio
    const [, setRefreshNavigatorPosition] = useState({});
    useResizeObserver(
        window.document.documentElement,
        useCallback(() => setRefreshNavigatorPosition({}), []),
    );

    const navigatorPosition = getProgressBarPosition(
        progressBarPosition,
        progressBarPositionAutoVertical,
        // the horizontal scrollbar is part of the bottom bar's padding
        topOffset + bottomBarHeight,
        scrollbar.ySize,
    );
    const { isLeft, isVertical, isHorizontal } = getProgressBarPositionInfo(navigatorPosition);

    useLayoutEffect(() => {
        chapterListPopupState.close();
    }, [currentChapterId]);

    return (
        <>
            <Stack
                sx={{
                    position: 'fixed',
                    top: topOffset,
                    right: `${scrollbar.ySize}px`,
                    bottom: 0,
                    left: 0,
                }}
            >
                <Stack
                    sx={{
                        flexGrow: 1,
                        minHeight: 0,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        justifyContent: isLeft ? 'flex-start' : 'flex-end',
                        pl: (theme) => `calc(${theme.spacing(1)} + env(safe-area-inset-left))`,
                        pr: (theme) => `calc(${theme.spacing(1)} + env(safe-area-inset-right))`,
                    }}
                >
                    {isVertical && (
                        <Box
                            sx={{
                                height: VERTICAL_NAVIGATOR_HEIGHT,
                                pointerEvents: 'all',
                                ...getReaderBarVisibilitySx(isVisible, isLeft ? 'left' : 'right'),
                            }}
                        >
                            <MobileReaderProgressBar progressBarPosition={navigatorPosition} />
                        </Box>
                    )}
                </Stack>
                <Stack sx={{ gap: 1, ...getReaderBarVisibilitySx(isVisible, 'bottom') }}>
                    {isHorizontal && (
                        <Box
                            sx={{
                                pl: 'env(safe-area-inset-left)',
                                pr: 'env(safe-area-inset-right)',
                                pointerEvents: 'all',
                            }}
                        >
                            <MobileReaderProgressBar progressBarPosition={navigatorPosition} />
                        </Box>
                    )}
                    <Box
                        ref={bottomBarRef}
                        sx={{
                            bgcolor: 'm3.readerBar',
                            color: 'm3.onSurface',
                            pb: `max(${scrollbar.xSize}px, env(safe-area-inset-bottom))`,
                            pl: 'env(safe-area-inset-left)',
                            pr: 'env(safe-area-inset-right)',
                            pointerEvents: 'all',
                        }}
                    >
                        <Stack
                            sx={{
                                flexDirection: 'row',
                                justifyContent: 'space-evenly',
                                alignItems: 'center',
                                height: 56,
                                px: 1,
                            }}
                        >
                            <ReaderBottomBarButton title={t`Reading mode`} {...bindTrigger(quickSettingsPopupState)}>
                                {READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode.value].icon}
                            </ReaderBottomBarButton>
                            <ReaderBottomBarButton title={t`Chapter list`} {...bindTrigger(chapterListPopupState)}>
                                <FormatListBulletedRoundedIcon />
                            </ReaderBottomBarButton>
                            <ReaderBottomBarButton title={t`Settings`} onClick={openSettings}>
                                <SettingsRoundedIcon />
                            </ReaderBottomBarButton>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
            <AdaptiveSheet
                open={chapterListPopupState.isOpen}
                onClose={chapterListPopupState.close}
                maxHeight={READER_SHEET_MAX_HEIGHT}
            >
                <ReaderChapterList
                    // the list scrolls itself; the sheet's bottom padding (home indicator) is outside of it
                    sx={{
                        minHeight: '15dvh',
                        maxHeight: `calc(${READER_SHEET_MAX_HEIGHT} - env(safe-area-inset-bottom))`,
                    }}
                    currentChapterId={currentChapterId}
                    chapters={chapters}
                />
            </AdaptiveSheet>
            <AdaptiveSheet open={quickSettingsPopupState.isOpen} onClose={quickSettingsPopupState.close}>
                <ReaderBottomBarMobileQuickSettings />
            </AdaptiveSheet>
        </>
    );
};

export const ReaderBottomBarMobile = memo(BaseReaderBottomBarMobile);
