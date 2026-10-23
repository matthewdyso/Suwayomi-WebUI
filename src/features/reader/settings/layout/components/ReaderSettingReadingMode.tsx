/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import type { IReaderSettingsWithDefaultFlag, ReadingMode } from '@/features/reader/Reader.types.ts';
import {
    READING_MODE_VALUE_TO_DISPLAY_DATA,
    READING_MODE_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import type { SelectButtonDefaultableProps } from '@/base/components/buttons/SelectButton.tsx';
import { ReaderSettingChipSelect } from '@/features/reader/settings/components/ReaderSettingChipSelect.tsx';
import { ReaderSettingIconGrid } from '@/features/reader/settings/components/ReaderSettingIconGrid.tsx';

export const ReaderSettingReadingMode = ({
    readingMode,
    setReadingMode,
    asIconGrid = false,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'readingMode'> &
    Pick<SelectButtonDefaultableProps<ReadingMode>, 'isDefaultable' | 'onDefault'> & {
        setReadingMode: (mode: ReadingMode) => void;
        asIconGrid?: boolean;
    }) => {
    const { t } = useLingui();
    const Select = asIconGrid ? ReaderSettingIconGrid : ReaderSettingChipSelect;

    return (
        <Select
            {...buttonSelectInputProps}
            label={t`Reading mode`}
            value={readingMode.isDefault ? undefined : readingMode.value}
            defaultValue={readingMode.isDefault ? readingMode.value : undefined}
            values={READING_MODE_VALUES}
            setValue={setReadingMode}
            valueToDisplayData={READING_MODE_VALUE_TO_DISPLAY_DATA}
        />
    );
};
