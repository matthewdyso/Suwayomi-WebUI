/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ArrowDownwardRounded from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRounded from '@mui/icons-material/ArrowUpwardRounded';
import Box from '@mui/material/Box';
import { memo } from 'react';
import type { RadioInputProps } from '@/base/components/inputs/RadioInput.tsx';
import { RadioInput } from '@/base/components/inputs/RadioInput.tsx';

interface IProps extends RadioInputProps {
    sortDescending?: boolean | null | undefined;
}

/**
 * Mihon's sort item: the active sort shows its direction arrow, the others an empty space instead of a radio circle.
 */
export const SortRadioInput = memo(({ sortDescending, checkedIcon, icon, ...rest }: IProps) => (
    <RadioInput
        {...rest}
        icon={icon ?? <Box sx={{ width: 24, height: 24 }} />}
        checkedIcon={
            checkedIcon ??
            (sortDescending ? <ArrowDownwardRounded color="primary" /> : <ArrowUpwardRounded color="primary" />)
        }
    />
));
