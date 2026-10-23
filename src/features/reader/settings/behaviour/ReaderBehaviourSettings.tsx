/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import type { ReaderService } from '@/features/reader/services/ReaderService.ts';
import type { IReaderSettingsWithDefaultFlag, ReaderSettingsTypeProps } from '@/features/reader/Reader.types.ts';
import { ReaderSettingExitMode } from '@/features/reader/settings/behaviour/components/ReaderSettingExitMode.tsx';
import { isOffsetDoubleSpreadPagesEditable } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import {
    DEFAULT_READER_SETTINGS,
    IMAGE_PRE_LOAD_AMOUNT,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderSettingAutoScroll } from '@/features/reader/auto-scroll/settings/ReaderSettingAutoScroll.tsx';
import { ReaderSettingScrollAmount } from '@/features/reader/settings/behaviour/components/ReaderSettingScrollAmount.tsx';
import { CheckboxItem, SliderItem } from '@/base/components/settings/SheetRows.tsx';

export const ReaderBehaviourSettings = ({
    settings,
    updateSetting,
    onDefault,
    isDefaultable,
}: {
    settings: IReaderSettingsWithDefaultFlag;
    updateSetting: (
        ...args: Parameters<typeof ReaderService.updateSetting>
    ) => ReturnType<typeof ReaderService.updateSetting>;
} & ReaderSettingsTypeProps) => {
    const { t } = useLingui();

    return (
        <Stack>
            <ReaderSettingExitMode
                exitMode={settings.exitMode}
                setExitMode={(value) => updateSetting('exitMode', value)}
            />
            <ReaderSettingScrollAmount
                scrollAmount={settings.scrollAmount}
                setScrollAmount={(value, commit) => updateSetting('scrollAmount', value, commit)}
            />
            <CheckboxItem
                label={t`Skip duplicate chapters`}
                checked={settings.shouldSkipDupChapters}
                onChange={(_, checked) => updateSetting('shouldSkipDupChapters', checked)}
            />
            <CheckboxItem
                primaryText={t`Skip filtered chapters`}
                secondaryText={isDefaultable ? t`Setting can not be changed while the reader is opened` : undefined}
                checked={settings.shouldSkipFilteredChapters}
                onChange={(_, checked) => updateSetting('shouldSkipFilteredChapters', checked)}
                disabled={isDefaultable}
            />
            {(isOffsetDoubleSpreadPagesEditable(settings.readingMode.value) || !isDefaultable) && (
                <CheckboxItem
                    label={t`Offset double spreads`}
                    checked={settings.shouldOffsetDoubleSpreads.value}
                    onChange={(_, checked) => updateSetting('shouldOffsetDoubleSpreads', checked)}
                />
            )}
            <CheckboxItem
                primaryText={t`Continuous chapter display`}
                secondaryText={t`Keep previous and upcoming chapters visible while reading in continuous reading modes, allowing seamless scrolling between chapters.`}
                checked={settings.shouldUseInfiniteScroll}
                onChange={(_, checked) => updateSetting('shouldUseInfiniteScroll', checked)}
            />
            <CheckboxItem
                primaryText={t`Show reading mode`}
                secondaryText={t`Briefly show current mode when reader is opened or mode got changed`}
                checked={settings.shouldShowReadingModePreview}
                onChange={(_, checked) => updateSetting('shouldShowReadingModePreview', checked)}
            />
            <CheckboxItem
                primaryText={t`Show tap zones overlay`}
                secondaryText={t`Briefly show tap zone layout preview when reader is opened or layout got changed`}
                checked={settings.shouldShowTapZoneLayoutPreview}
                onChange={(_, checked) => updateSetting('shouldShowTapZoneLayoutPreview', checked)}
            />
            <CheckboxItem
                primaryText={t`Auto webtoon mode`}
                secondaryText={t`Automatically use webtoon mode for entries that are detected to likely use the long strip format`}
                checked={settings.shouldUseAutoWebtoonMode}
                onChange={(_, checked) => updateSetting('shouldUseAutoWebtoonMode', checked)}
            />
            <CheckboxItem
                label={t`Show transition page`}
                checked={settings.shouldShowTransitionPage}
                onChange={(_, checked) => updateSetting('shouldShowTransitionPage', checked)}
            />
            <CheckboxItem
                label={t`Inform about missing chapters on chapter transition`}
                checked={settings.shouldInformAboutMissingChapter}
                onChange={(_, checked) => updateSetting('shouldInformAboutMissingChapter', checked)}
            />
            <CheckboxItem
                label={t`Inform about changing scanlator on chapter transition`}
                checked={settings.shouldInformAboutScanlatorChange}
                onChange={(_, checked) => updateSetting('shouldInformAboutScanlatorChange', checked)}
            />
            <CheckboxItem
                label={t`Keep screen on`}
                checked={settings.shouldWakeLockScreen}
                onChange={(_, checked) => updateSetting('shouldWakeLockScreen', checked)}
            />
            <ReaderSettingAutoScroll
                autoScroll={settings.autoScroll}
                setAutoScroll={(...args) => updateSetting('autoScroll', ...args)}
            />
            <SliderItem
                label={t`Preload images`}
                value={settings.imagePreLoadAmount}
                onDefault={() => onDefault?.('imagePreLoadAmount')}
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.imagePreLoadAmount,
                        value: settings.imagePreLoadAmount,
                        step: IMAGE_PRE_LOAD_AMOUNT.step,
                        min: IMAGE_PRE_LOAD_AMOUNT.min,
                        max: IMAGE_PRE_LOAD_AMOUNT.max,
                        onChange: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, false);
                        },
                        onChangeCommitted: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, true);
                        },
                    },
                }}
            />
        </Stack>
    );
};
