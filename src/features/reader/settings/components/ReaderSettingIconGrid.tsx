/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import type { ReaderSettingSelectProps } from '@/features/reader/settings/components/ReaderSettingSelect.utils.ts';
import {
    getReaderSettingValueAfterClick,
    isReaderSettingOptionSelected,
} from '@/features/reader/settings/components/ReaderSettingSelect.utils.ts';
import { ReaderSettingHeading, ReaderSettingRow } from '@/features/reader/settings/components/ReaderSettingRow.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';
import { M3_STATE_LAYER_SX, m3StateLayerInteractionsSx } from '@/features/theme/m3/M3StateLayer.ts';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

const TOGGLE_CLASS_NAME = 'ReaderSettingIconGrid-toggle';

/**
 * Mihon's "SettingsIconGrid" item: a 48 px "FilledIconToggleButton" with the option's name below it.
 */
const IconGridItem = styled(ButtonBase)(({ theme }) => ({
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: theme.spacing(0.5),
    borderRadius: M3_SHAPE.medium,
    color: theme.palette.m3.onSurface,
    ...m3StateLayerInteractionsSx(`.${TOGGLE_CLASS_NAME}`),
    [`& .${TOGGLE_CLASS_NAME}`]: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: M3_LAYOUT.minTouchTarget,
        borderRadius: M3_SHAPE.full,
        backgroundColor: theme.palette.m3.surfaceContainerHighest,
        color: theme.palette.m3.onSurfaceVariant,
        transition: [
            m3Transition(['border-radius'], M3_SPRING.fastSpatial),
            m3Transition(['background-color', 'color'], M3_SPRING.fastEffects),
        ].join(', '),
        '&::before': M3_STATE_LAYER_SX,
    },
    [`&:active .${TOGGLE_CLASS_NAME}`]: {
        borderRadius: M3_SHAPE.medium,
    },
    '&[aria-pressed="true"]': {
        [`& .${TOGGLE_CLASS_NAME}`]: {
            backgroundColor: theme.palette.m3.primary,
            color: theme.palette.m3.onPrimary,
        },
    },
}));

/**
 * Mihon's "ReadingModeSelectDialog" look: an icon toggle per option in a grid; changes apply right away.
 *
 * While the default is used, its option is marked with a "*"; otherwise a button ("Reset to Default", Mihon's
 * "Revert to default") resets the setting to the default.
 */
export const ReaderSettingIconGrid = <Value extends string | number, MultiValue extends Value | Value[] = Value>({
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
        <Stack>
            <ReaderSettingHeading label={label} description={description} />
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                    gap: 1,
                    px: 3,
                    pb: 1.25,
                }}
            >
                {values.map((option) => {
                    const { title, icon } = valueToDisplayData[option];
                    const isDefault = value === undefined && option === defaultValue;
                    const isSelected = isReaderSettingOptionSelected(value, option) || isDefault;

                    return (
                        <IconGridItem
                            key={option}
                            aria-pressed={isSelected}
                            onClick={() => setValue(getReaderSettingValueAfterClick<Value, MultiValue>(value, option))}
                        >
                            <Box className={TOGGLE_CLASS_NAME}>{icon}</Box>
                            <Typography variant="bodySmall" sx={{ textAlign: 'center' }}>
                                {typeof title === 'string' ? title : t(title)}
                                {isDefault && '*'}
                            </Typography>
                        </IconGridItem>
                    );
                })}
            </Box>
            {isDefaultable && value !== undefined && (
                <ReaderSettingRow sx={{ pt: 0 }}>
                    <Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={onDefault}>
                        {t`Reset to Default`}
                    </Button>
                </ReaderSettingRow>
            )}
        </Stack>
    );
};
