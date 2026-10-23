/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { memo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { ReaderSettingReadingMode } from '@/features/reader/settings/layout/components/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/features/reader/settings/layout/components/ReaderSettingReadingDirection.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { DefaultSettingFootnote } from '@/features/reader/settings/components/DefaultSettingFootnote.tsx';
import { ReaderSettingAutoScroll } from '@/features/reader/auto-scroll/settings/ReaderSettingAutoScroll.tsx';
import {
    getReaderAutoScrollStore,
    useReaderAutoScrollStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { CheckboxItem } from '@/base/components/settings/SheetRows.tsx';

/**
 * Mihon's "ReadingModeSelectDialog": the reading mode and direction as icon grids, plus the auto scroll settings.
 */
const BaseReaderBottomBarMobileQuickSettings = () => {
    const { t } = useLingui();
    const isActive = useReaderAutoScrollStore('isActive');
    const { readingMode, readingDirection, autoScroll } = useReaderSettingsStore(
        'readingMode',
        'readingDirection',
        'autoScroll',
    );

    return (
        <Stack sx={{ py: 1 }}>
            <DefaultSettingFootnote />
            <ReaderSettingReadingMode
                asIconGrid
                readingMode={readingMode}
                setReadingMode={(value) => ReaderService.updateSetting('readingMode', value)}
                isDefaultable
                onDefault={() => ReaderService.deleteSetting('readingMode')}
            />
            <ReaderSettingReadingDirection
                asIconGrid
                readingDirection={readingDirection}
                setReadingDirection={(value) => ReaderService.updateSetting('readingDirection', value)}
                isDefaultable
                onDefault={() => ReaderService.deleteSetting('readingDirection')}
            />
            <CheckboxItem
                label={t`Auto scroll`}
                checked={isActive}
                onChange={() => getReaderAutoScrollStore().toggleActive()}
            />
            <ReaderSettingAutoScroll
                autoScroll={autoScroll}
                setAutoScroll={(...args) => ReaderService.updateSetting('autoScroll', ...args)}
            />
        </Stack>
    );
};

export const ReaderBottomBarMobileQuickSettings = memo(BaseReaderBottomBarMobileQuickSettings);
