/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import type { Ref } from 'react';
import { ListGroupHeader } from '@/base/components/lists/ListGroupHeader.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { getDownloadQueueItemSx } from '@/features/downloads/Downloads.utils.ts';

/**
 * Mihon's download queue section header: "Source (N)" with a drag handle, on a surface that lifts while dragged.
 */
export const DownloadGroupHeader = ({
    ref,
    title,
    language,
    itemCount,
    isDragOverlay = false,
}: {
    ref?: Ref<HTMLDivElement>;
    title: string;
    language: string | undefined;
    itemCount: number;
    isDragOverlay?: boolean;
}) => (
    <Stack
        ref={ref}
        sx={MUIUtil.mergeSx(getDownloadQueueItemSx(isDragOverlay), {
            flexDirection: 'row',
            alignItems: 'center',
            mt: 1,
            pr: 1,
        })}
    >
        <ListGroupHeader component="h2" sx={{ flexGrow: 1, minWidth: 0 }}>
            {title} ({itemCount})
            {!!language && (
                <Box component="span" sx={{ fontWeight: 400, opacity: SECONDARY_ALPHA }}>
                    {` • ${language}`}
                </Box>
            )}
        </ListGroupHeader>
        <DragHandleRoundedIcon sx={{ m: 1, color: 'm3.onSurfaceVariant' }} />
    </Stack>
);
