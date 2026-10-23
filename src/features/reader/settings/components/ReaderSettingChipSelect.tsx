/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { ChipRow } from '@/base/components/chips/ChipRow.tsx';
import { ReaderSettingHeading } from '@/features/reader/settings/components/ReaderSettingRow.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Superscript } from '@/base/components/texts/Superscript.tsx';
import type { ReaderSettingSelectProps } from '@/features/reader/settings/components/ReaderSettingSelect.utils.ts';
import {
    getReaderSettingValueAfterClick,
    isReaderSettingOptionSelected,
} from '@/features/reader/settings/components/ReaderSettingSelect.utils.ts';

/**
 * Mihon's "SettingsChipRow": a heading over a wrapping row of text-only filter chips, one per option.
 */
export const ReaderSettingChipSelect = <Value extends string | number, MultiValue extends Value | Value[] = Value>({
    label,
    description,
    value,
    defaultValue,
    values,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
}: ReaderSettingSelectProps<Value, MultiValue>) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ pb: 1.25 }}>
            <ReaderSettingHeading label={label} description={description} />
            <ChipRow wrap sx={{ px: 3, rowGap: 1 }}>
                {isDefaultable && (
                    <Chip
                        label={t`Default`}
                        variant={value === undefined ? 'filled' : 'outlined'}
                        aria-pressed={value === undefined}
                        onClick={onDefault}
                    />
                )}
                {values.map((option) => {
                    const { title } = valueToDisplayData[option];
                    const text = typeof title === 'string' ? title : t(title);
                    const isSelected = isReaderSettingOptionSelected(value, option);
                    const isDefault = value === undefined && option === defaultValue;

                    return (
                        <CustomTooltip key={option} title={isDefault ? t`Active setting` : ''}>
                            <Chip
                                label={isDefault ? <Superscript superscript="*" text={text} /> : text}
                                variant={isSelected ? 'filled' : 'outlined'}
                                aria-pressed={isSelected}
                                onClick={() =>
                                    setValue(getReaderSettingValueAfterClick<Value, MultiValue>(value, option))
                                }
                            />
                        </CustomTooltip>
                    );
                })}
            </ChipRow>
        </Stack>
    );
};
