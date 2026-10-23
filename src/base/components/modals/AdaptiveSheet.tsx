/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useEffect, useEffectEvent, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import type { SxProps, Theme } from '@mui/material/styles';
import { sliderClasses } from '@mui/material/Slider';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_EASING, M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';

/**
 * Mihon closes its sheets when they were dragged down further than this.
 */
const DRAG_TO_CLOSE_THRESHOLD_PX = 56;

const SHEET_MAX_WIDTH = 460;
const DIALOG_MAX_WIDTH = 600;
const SHEET_EXIT_DURATION = 200;

/**
 * Whether the touch started in content that is scrolled down, which has to scroll up first before the sheet moves
 * (Mihon's nested scrolling).
 */
const isInsideScrolledContent = (target: EventTarget | null, sheet: HTMLElement): boolean => {
    for (let element = target instanceof Element ? target : null; element; element = element.parentElement) {
        if (element.scrollTop > 0) {
            return true;
        }

        if (element === sheet) {
            return false;
        }
    }

    return false;
};

/**
 * Lets the user drag the bottom sheet down to close it.
 *
 * Native listeners, because React registers touch listeners as passive and the drag has to prevent the page from
 * scrolling. The sheet is passed as an element (not a ref): the drawer's portal mounts it a render after it opens, so
 * the listeners have to be added once it exists.
 */
const useDragToClose = (sheet: HTMLDivElement | null, onClose: () => void, enabled: boolean) => {
    const close = useEffectEvent(onClose);

    useEffect(() => {
        if (!enabled || !sheet) {
            return () => {};
        }

        let start: { x: number; y: number } | null = null;
        let isDragging = false;
        let offset = 0;

        const reset = () => {
            start = null;
            isDragging = false;
            offset = 0;
        };

        const handleTouchStart = (event: TouchEvent) => {
            reset();

            const isSlider = event.target instanceof Element && !!event.target.closest(`.${sliderClasses.root}`);
            if (event.touches.length !== 1 || isSlider || isInsideScrolledContent(event.target, sheet)) {
                return;
            }

            start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!start) {
                return;
            }

            const deltaX = event.touches[0].clientX - start.x;
            const deltaY = event.touches[0].clientY - start.y;

            if (!isDragging) {
                const isPullingDown = deltaY > 0 && Math.abs(deltaY) > Math.abs(deltaX);
                if (!isPullingDown) {
                    start = null;
                    return;
                }

                isDragging = true;
            }

            event.preventDefault();
            offset = Math.max(0, deltaY);
            sheet.style.setProperty('transition', 'none');
            sheet.style.setProperty('transform', `translateY(${offset}px)`);
        };

        const handleTouchEnd = () => {
            if (!isDragging) {
                reset();
                return;
            }

            if (offset > DRAG_TO_CLOSE_THRESHOLD_PX) {
                // the exit transition slides the sheet out from where it was dropped
                close();
            } else {
                sheet.style.setProperty('transition', m3Transition(['transform'], M3_SPRING.defaultSpatial));
                sheet.style.removeProperty('transform');
            }

            reset();
        };

        sheet.addEventListener('touchstart', handleTouchStart, { passive: true });
        sheet.addEventListener('touchmove', handleTouchMove, { passive: false });
        sheet.addEventListener('touchend', handleTouchEnd);
        sheet.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            sheet.removeEventListener('touchstart', handleTouchStart);
            sheet.removeEventListener('touchmove', handleTouchMove);
            sheet.removeEventListener('touchend', handleTouchEnd);
            sheet.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [enabled, sheet]);
};

export type AdaptiveSheetProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    /**
     * Stays above the scrolling content, e.g. the sheet's tabs.
     */
    header?: ReactNode;
    /**
     * CSS length of the phone sheet's max height (Mihon: 90dvh, chapter lists in the reader: 75dvh).
     */
    maxHeight?: string;
    minHeight?: number;
    contentSx?: SxProps<Theme>;
    /**
     * Leaves the content behind the sheet undimmed, e.g. while it previews a color filter.
     */
    hideBackdrop?: boolean;
    /**
     * Makes the sheet see-through, e.g. while a slider that changes the content behind it is dragged.
     */
    transparent?: boolean;
};

/**
 * Mihon's reader settings sheet while a slider of the color filter page is dragged.
 */
const TRANSPARENT_SHEET_ALPHA = 0.75;

/**
 * Mihon's "AdaptiveSheet": a bottom sheet on phones, a centered dialog on larger screens.
 *
 * The sheet is closed by tapping the scrim or by dragging it down (once its content is scrolled to the top). The theme
 * pads the bottom sheet by the bottom safe-area inset, so its content ends above the home indicator.
 */
export const AdaptiveSheet = ({
    open,
    onClose,
    children,
    header,
    maxHeight = '90dvh',
    minHeight,
    contentSx,
    hideBackdrop = false,
    transparent = false,
}: AdaptiveSheetProps) => {
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const [sheet, setSheet] = useState<HTMLDivElement | null>(null);

    useDragToClose(sheet, onClose, open && isMobileWidth);

    const content = (
        <>
            {header && <Box sx={{ flexShrink: 0 }}>{header}</Box>}
            <Box
                sx={MUIUtil.mergeSx(
                    {
                        flexGrow: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overscrollBehaviorY: 'contain',
                    },
                    contentSx,
                )}
            >
                {children}
            </Box>
        </>
    );

    const paperSx: SxProps<Theme> = {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight,
    };

    // on the modal's root: the paper's transition is set inline by the slide transition and the drag
    const rootSx: SxProps<Theme> = {
        opacity: transparent ? TRANSPARENT_SHEET_ALPHA : undefined,
        transition: m3Transition(['opacity'], M3_SPRING.fastEffects),
    };

    if (!isMobileWidth) {
        return (
            <Dialog
                open={open}
                onClose={onClose}
                hideBackdrop={hideBackdrop}
                sx={rootSx}
                maxWidth={false}
                slotProps={{
                    paper: {
                        sx: MUIUtil.mergeSx(paperSx, {
                            width: '100%',
                            maxWidth: DIALOG_MAX_WIDTH,
                            my: 2,
                            maxHeight: 'calc(100% - 32px)',
                        }),
                    },
                }}
            >
                {content}
            </Dialog>
        );
    }

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            hideBackdrop={hideBackdrop}
            sx={rootSx}
            transitionDuration={{ enter: M3_SPRING.defaultSpatial.duration, exit: SHEET_EXIT_DURATION }}
            slotProps={{
                transition: {
                    easing: { enter: M3_SPRING.defaultSpatial.easing, exit: M3_EASING.emphasizedAccelerate },
                },
                paper: {
                    ref: setSheet,
                    sx: MUIUtil.mergeSx(paperSx, {
                        width: '100%',
                        maxWidth: SHEET_MAX_WIDTH,
                        mx: 'auto',
                        maxHeight,
                    }),
                },
            }}
        >
            {content}
        </Drawer>
    );
};
