/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import type { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { CUSTOM_FILTER, DEFAULT_READER_SETTINGS } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { CheckboxItem, SliderItem } from '@/base/components/settings/SheetRows.tsx';

export const ReaderSettingBrightness = ({
    brightness,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'brightness'> & {
    updateSetting: <Filter extends keyof IReaderSettings['customFilter']>(
        filter: Filter,
        value: IReaderSettings['customFilter'][Filter],
        commit: boolean,
    ) => void;
}) => {
    const { t } = useLingui();

    return (
        <Stack>
            <CheckboxItem
                label={t`Custom brightness`}
                checked={brightness.enabled}
                onChange={(_, checked) => updateSetting('brightness', { ...brightness, enabled: checked }, true)}
            />
            {brightness.enabled && (
                <SliderItem
                    label={t`Custom brightness`}
                    value={brightness.value}
                    onDefault={() =>
                        updateSetting(
                            'brightness',
                            { ...brightness, value: DEFAULT_READER_SETTINGS.customFilter.brightness.value },
                            true,
                        )
                    }
                    slotProps={{
                        slider: {
                            defaultValue: DEFAULT_READER_SETTINGS.customFilter.brightness.value,
                            value: brightness.value,
                            step: CUSTOM_FILTER.brightness.step,
                            min: CUSTOM_FILTER.brightness.min,
                            max: CUSTOM_FILTER.brightness.max,
                            onChange: (_, value) => {
                                updateSetting('brightness', { ...brightness, value: value as number }, false);
                            },
                            onChangeCommitted: (_, value) => {
                                updateSetting('brightness', { ...brightness, value: value as number }, true);
                            },
                        },
                    }}
                />
            )}
        </Stack>
    );
};
