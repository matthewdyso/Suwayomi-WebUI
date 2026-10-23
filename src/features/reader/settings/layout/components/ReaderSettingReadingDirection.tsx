/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import type { IReaderSettingsWithDefaultFlag, ReadingDirection } from '@/features/reader/Reader.types.ts';
import type { SelectButtonDefaultableProps } from '@/base/components/buttons/SelectButton.tsx';
import {
    READING_DIRECTION_VALUE_TO_DISPLAY_DATA,
    READING_DIRECTION_VALUES,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderSettingChipSelect } from '@/features/reader/settings/components/ReaderSettingChipSelect.tsx';
import { ReaderSettingIconGrid } from '@/features/reader/settings/components/ReaderSettingIconGrid.tsx';

export const ReaderSettingReadingDirection = ({
    readingDirection,
    setReadingDirection,
    asIconGrid = false,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'readingDirection'> &
    Pick<SelectButtonDefaultableProps<ReadingDirection>, 'isDefaultable' | 'onDefault'> & {
        setReadingDirection: (readingDirection: ReadingDirection) => void;
        asIconGrid?: boolean;
    }) => {
    const { t } = useLingui();
    const Select = asIconGrid ? ReaderSettingIconGrid : ReaderSettingChipSelect;

    return (
        <Select
            {...buttonSelectInputProps}
            label={t`Reading direction`}
            value={readingDirection.isDefault ? undefined : readingDirection.value}
            defaultValue={readingDirection.isDefault ? readingDirection.value : undefined}
            values={READING_DIRECTION_VALUES}
            setValue={setReadingDirection}
            valueToDisplayData={READING_DIRECTION_VALUE_TO_DISPLAY_DATA}
        />
    );
};
