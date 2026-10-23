/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { memo, useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { getIndexOfPage, getPage } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.utils.tsx';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { ReaderNavBarDesktopNextPreviousButton } from '@/features/reader/overlay/navigation/desktop/components/ReaderNavBarDesktopNextPreviousButton.tsx';
import { READING_DIRECTION_TO_THEME_DIRECTION } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { useReaderPagesStore, useReaderSettingsStore } from '@/features/reader/stores/ReaderStore.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ReaderProgressBarDirectionWrapper } from '@/features/reader/overlay/progress-bar/components/ReaderProgressBarDirectionWrapper.tsx';
import { ReaderPageSliderPill } from '@/features/reader/overlay/progress-bar/components/ReaderPageSliderPill.tsx';

const BaseReaderNavBarDesktopPageNavigation = () => {
    const { t } = useLingui();
    const getOptionForDirection = useGetOptionForDirection();
    const { currentPageIndex, pages } = useReaderPagesStore('currentPageIndex', 'pages');
    const readingDirection = useReaderSettingsStore((state) => state.readingDirection.value);

    const currentPage = useMemo(() => getPage(currentPageIndex, pages), [currentPageIndex, pages]);
    const direction = READING_DIRECTION_TO_THEME_DIRECTION[readingDirection];

    return (
        <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }} dir="ltr">
            <ReaderNavBarDesktopNextPreviousButton
                type="previous"
                title={getOptionForDirection(t`Previous page`, t`Next page`, direction)}
                disabled={getOptionForDirection(
                    !currentPage.primary.index,
                    getIndexOfPage(currentPage) === getIndexOfPage(pages.slice(-1)[0]),
                    direction,
                )}
                onClick={() => ReaderControls.openPage('previous', undefined, false)}
            />
            <ReaderProgressBarDirectionWrapper sx={{ display: 'flex', flexGrow: 1, minWidth: 0 }}>
                <ReaderPageSliderPill containerColor="surfaceContainerHighest" />
            </ReaderProgressBarDirectionWrapper>
            <ReaderNavBarDesktopNextPreviousButton
                type="next"
                title={getOptionForDirection(t`Next page`, t`Previous page`, direction)}
                disabled={getOptionForDirection(
                    getIndexOfPage(currentPage) === getIndexOfPage(pages.slice(-1)[0]),
                    !currentPage.primary.index,
                    direction,
                )}
                onClick={() => ReaderControls.openPage('next', undefined, false)}
            />
        </Stack>
    );
};

export const ReaderNavBarDesktopPageNavigation = memo(BaseReaderNavBarDesktopPageNavigation);
