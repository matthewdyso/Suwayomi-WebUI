/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { CustomIconButton } from '@/base/components/buttons/CustomIconButton.tsx';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * The same 48 px round button in the page and the chapter row, so their ends line up.
 */
const BUTTON_SIZE = M3_LAYOUT.minTouchTarget;

export const ReaderNavBarDesktopNextPreviousButton = ({
    title,
    type,
    disabled,
    ...customIconButtonProps
}: Omit<ComponentProps<typeof CustomIconButton>, 'children'> & {
    title: string;
    type: 'previous' | 'next';
}) => (
    <CustomTooltip title={title} disabled={disabled}>
        <CustomIconButton
            sx={{ flexShrink: 0, width: BUTTON_SIZE, height: BUTTON_SIZE }}
            variant="tonal"
            disabled={disabled}
            {...customIconButtonProps}
        >
            {type === 'previous' ? <KeyboardArrowLeftRoundedIcon /> : <KeyboardArrowRightRoundedIcon />}
        </CustomIconButton>
    </CustomTooltip>
);
