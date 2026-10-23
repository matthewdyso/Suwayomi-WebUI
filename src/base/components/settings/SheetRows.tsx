/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import type { RadioInputProps } from '@/base/components/inputs/RadioInput.tsx';
import { RadioInput } from '@/base/components/inputs/RadioInput.tsx';
import { ThreeStateCheckboxInput } from '@/base/components/inputs/ThreeStateCheckboxInput.tsx';
import { SortRadioInput } from '@/base/components/inputs/SortRadioInput.tsx';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

/**
 * Mihon's "SettingsItemsPaddings" (24 horizontal, 10 vertical).
 */
const SHEET_ROW_PADDING_SX = { px: 3, py: 1.25 } as const;

/**
 * Full-bleed clickable row, 44 px tall like Mihon's: the whole row is the touch target, so the control's 48 px hit
 * box is pulled in to its 24 px glyph vertically too.
 */
const SHEET_CONTROL_ROW_SX: SxProps<Theme> = {
    position: 'relative',
    display: 'flex',
    width: '100%',
    ...SHEET_ROW_PADDING_SX,
    [`& > .${buttonBaseClasses.root}`]: {
        my: '-12px',
    },
    color: 'm3.onSurface',
    ...m3StateLayerSx(),
};

/**
 * Section title inside a sheet (Mihon's "HeadingItem").
 */
export const HeadingItem = ({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) => (
    <Typography
        variant="header"
        component="div"
        sx={MUIUtil.mergeSx({ ...SHEET_ROW_PADDING_SX, color: 'm3.onSurfaceVariant' }, sx)}
    >
        {children}
    </Typography>
);

export const CheckboxItem = ({ sx, ...props }: ComponentProps<typeof CheckboxInput>) => (
    <CheckboxInput {...props} sx={MUIUtil.mergeSx(SHEET_CONTROL_ROW_SX, sx)} />
);

/**
 * Has to be rendered inside a RadioGroup.
 */
export const RadioItem = ({ sx, ...props }: RadioInputProps) => (
    <RadioInput {...props} sx={MUIUtil.mergeSx(SHEET_CONTROL_ROW_SX, sx)} />
);

export const TriStateItem = ({ sx, ...props }: ComponentProps<typeof ThreeStateCheckboxInput>) => (
    <ThreeStateCheckboxInput {...props} sx={MUIUtil.mergeSx(SHEET_CONTROL_ROW_SX, sx)} />
);

/**
 * Has to be rendered inside a RadioGroup.
 */
export const SortItem = ({ sx, ...props }: ComponentProps<typeof SortRadioInput>) => (
    <SortRadioInput {...props} sx={MUIUtil.mergeSx(SHEET_CONTROL_ROW_SX, sx)} />
);

export const SliderItem = (props: ComponentProps<typeof SliderInput>) => (
    <Box sx={SHEET_ROW_PADDING_SX}>
        <SliderInput {...props} />
    </Box>
);
