/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { memo, useCallback, useRef, useState } from 'react';
import { ReaderSettings } from '@/features/reader/settings/screens/ReaderSettings.tsx';
import { ReaderPageNumber } from '@/features/reader/overlay/components/ReaderPageNumber.tsx';
import { StandardReaderProgressBar } from '@/features/reader/overlay/progress-bar/desktop/StandardReaderProgressBar.tsx';
import { ReaderNavBarDesktop } from '@/features/reader/overlay/navigation/desktop/ReaderNavBarDesktop.tsx';
import { ReaderOverlayHeaderMobile } from '@/features/reader/overlay/mobile/ReaderOverlayHeaderMobile.tsx';
import { ReaderBottomBarMobile } from '@/features/reader/overlay/navigation/mobile/ReaderBottomBarMobile.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { useReaderOverlayStore, useReaderSettingsStore } from '@/features/reader/stores/ReaderStore.ts';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';

const HIDDEN_STATUS_BAR_SCRIM_STYLES = { ':root': { [M3_CSS_VARIABLE.statusBarScrimOpacity]: 0 } };

const BaseReaderOverlay = ({
    isDesktop,
    isMobile,
}: Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'isDesktop' | 'isMobile'>) => {
    const isVisible = useReaderOverlayStore('isVisible');
    const isStaticNav = useReaderSettingsStore('isStaticNav');
    // immersive like Mihon: the pages fill the screen under the status bar; the scrim returns with the bars (a static
    // desktop navigation drawer stays open, so it keeps the scrim)
    const isImmersive = !isVisible && !(isDesktop && isStaticNav);

    const [areSettingsOpen, setAreSettingsOpen] = useState(false);

    const [mobileHeaderHeight, setMobileHeaderHeight] = useState(0);
    const mobileHeaderRef = useRef<HTMLDivElement>(null);
    useResizeObserver(
        mobileHeaderRef,
        useCallback(() => setMobileHeaderHeight(mobileHeaderRef.current?.clientHeight ?? 0), [isMobile]),
    );

    return (
        <Box sx={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {isImmersive && <GlobalStyles styles={HIDDEN_STATUS_BAR_SCRIM_STYLES} />}
            {isDesktop && (
                <>
                    <StandardReaderProgressBar />
                    <ReaderNavBarDesktop isVisible={isVisible} openSettings={() => setAreSettingsOpen(true)} />
                </>
            )}

            {isMobile && (
                <>
                    <ReaderOverlayHeaderMobile ref={mobileHeaderRef} isVisible={isVisible} />
                    <ReaderBottomBarMobile
                        openSettings={() => setAreSettingsOpen(true)}
                        isVisible={isVisible}
                        topOffset={mobileHeaderHeight}
                    />
                </>
            )}

            <ReaderSettings isOpen={areSettingsOpen} close={() => setAreSettingsOpen(false)} />

            <ReaderPageNumber />
        </Box>
    );
};

export const ReaderOverlay = withPropsFrom(
    memo(BaseReaderOverlay),
    [ReaderService.useOverlayMode],
    ['isDesktop', 'isMobile'],
);
