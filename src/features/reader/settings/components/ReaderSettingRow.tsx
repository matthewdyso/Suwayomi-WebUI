/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { HeadingItem } from '@/base/components/settings/SheetRows.tsx';

/**
 * Mihon's "SettingsItemsPaddings" (24 horizontal, 10 vertical) for setting rows without their own row component
 * (checkboxes and sliders use the sheet rows, which bring these paddings).
 */
export const ReaderSettingRow = ({ sx, ...props }: BoxProps) => (
    <Box {...props} sx={MUIUtil.mergeSx({ px: 3, py: 1.25 }, sx)} />
);

/**
 * The heading of a setting with options (Mihon's "HeadingItem"), with an optional description below it.
 */
export const ReaderSettingHeading = ({ label, description }: { label: string; description?: string }) => (
    <>
        <HeadingItem sx={{ pb: description ? 0 : undefined }}>{label}</HeadingItem>
        {description && (
            <Typography variant="bodySmall" sx={{ px: 3, pb: 1.25, color: 'text.secondary' }}>
                {description}
            </Typography>
        )}
    </>
);
