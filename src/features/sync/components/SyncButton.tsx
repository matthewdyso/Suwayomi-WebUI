/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloudSyncRoundedIcon from '@mui/icons-material/CloudSyncRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { WAVY_ICON_PROGRESS_PROPS, WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';
import { useStartSync } from '@/features/sync/hooks/useStartSync.ts';

export function SyncButton() {
    const { t } = useLingui();
    const { isEnabled, isSyncing, syncStateTitle, startSync } = useStartSync();

    if (!isEnabled) {
        return null;
    }

    return (
        <CustomTooltip title={syncStateTitle ?? t`Sync now`}>
            {isSyncing ? (
                // takes the icon button's place so the other app bar actions don't move
                <Box
                    sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: M3_LAYOUT.minTouchTarget,
                        height: M3_LAYOUT.minTouchTarget,
                    }}
                >
                    <WavyCircularProgress {...WAVY_ICON_PROGRESS_PROPS} aria-label={syncStateTitle} />
                </Box>
            ) : (
                <IconButton onClick={startSync} color="inherit">
                    <CloudSyncRoundedIcon />
                </IconButton>
            )}
        </CustomTooltip>
    );
}
