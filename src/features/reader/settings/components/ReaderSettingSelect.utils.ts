/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SelectButtonProps } from '@/base/components/buttons/SelectButton.tsx';

/**
 * The props of the reader's option selects (chip rows and icon grids); the same as "ButtonSelectInput"'s, so a setting
 * can switch between them.
 *
 * "value" is undefined while the setting uses its default ("defaultValue"), which is then marked with a "*".
 */
export type ReaderSettingSelectProps<
    Value extends string | number,
    MultiValue extends Value | Value[] = Value,
> = SelectButtonProps<Value, MultiValue> & {
    label: string;
    description?: string;
};

export const isReaderSettingOptionSelected = <Value extends string | number>(
    value: Value | Value[] | undefined,
    option: Value,
): boolean => (Array.isArray(value) ? value.includes(option) : value === option);

/**
 * The value after the option was clicked: multi selects toggle the option, single selects take it.
 */
export const getReaderSettingValueAfterClick = <
    Value extends string | number,
    MultiValue extends Value | Value[] = Value,
>(
    value: MultiValue | undefined,
    option: Value,
): MultiValue => {
    if (!Array.isArray(value)) {
        return option as MultiValue;
    }

    return (value.includes(option) ? value.filter((v) => v !== option) : [...value, option]) as MultiValue;
};
