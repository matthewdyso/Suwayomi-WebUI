/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SliderProps } from '@mui/material/Slider';
import Slider from '@mui/material/Slider';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { ResetButton } from '@/base/components/buttons/ResetButton.tsx';
import { Pill } from '@/base/components/badges/Pill.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

/**
 * Mihon's slider item: the label and the value (in a pill) above a full-width slider.
 */
export const SliderInput = ({
    label,
    value,
    onDefault,
    slotProps,
}: {
    label: string;
    value: number | string;
    onDefault?: () => void;
    slotProps?: {
        label?: TypographyProps;
        value?: TypographyProps;
        slider?: SliderProps;
    };
}) => (
    <Stack sx={{ gap: '2px' }}>
        <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center', minHeight: 40 }}>
            <Typography
                variant="bodyMedium"
                {...slotProps?.label}
                sx={MUIUtil.mergeSx({ flexGrow: 1, minWidth: 0 }, slotProps?.label?.sx)}
            >
                {label}
            </Typography>
            <Pill>
                <Typography variant="bodyMedium" component="span" {...slotProps?.value} sx={slotProps?.value?.sx}>
                    {value}
                </Typography>
            </Pill>
            {onDefault && <ResetButton asIconButton onClick={onDefault} />}
        </Stack>
        <Slider {...slotProps?.slider} sx={slotProps?.slider?.sx} />
    </Stack>
);
