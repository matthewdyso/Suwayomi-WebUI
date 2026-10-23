/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { alpha } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';
import { DOWNLOAD_INDICATOR_SIZE } from '@/base/components/downloads/DownloadStateIndicatorCircular.tsx';

/**
 * Mihon's download indicator for chapters that aren't in the download queue: an arrow in a circle that downloads the
 * chapter, or (with "showDownloaded") a check for downloaded chapters.
 */
export const ChapterDownloadButton = ({
    chapterId,
    isDownloaded,
    showDownloaded = false,
}: {
    chapterId: ChapterIdInfo['id'];
    isDownloaded: boolean;
    showDownloaded?: boolean;
}) => {
    const { t } = useLingui();
    const download = Chapters.useDownloadStatusFromCache(chapterId);

    const downloadChapter = () => {
        requestManager
            .addChapterToDownloadQueue(chapterId)
            .response.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));
    };

    if (download != null) {
        return null;
    }

    if (isDownloaded) {
        if (!showDownloaded) {
            return null;
        }

        return (
            <CustomTooltip title={t`Downloaded`}>
                <Box
                    role="img"
                    aria-label={t`Downloaded`}
                    sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: M3_LAYOUT.minTouchTarget,
                        height: M3_LAYOUT.minTouchTarget,
                        color: 'm3.onSurfaceVariant',
                    }}
                >
                    <CheckCircleRoundedIcon sx={{ fontSize: DOWNLOAD_INDICATOR_SIZE }} />
                </Box>
            </CustomTooltip>
        );
    }

    return (
        <CustomTooltip title={t`Download`}>
            <IconButton
                {...MUIUtil.preventRippleProp()}
                aria-label={t`Download`}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    downloadChapter();
                }}
                // the 26 px indicator would grow the default hit box past the 48 px of the downloaded check
                sx={{
                    width: M3_LAYOUT.minTouchTarget,
                    height: M3_LAYOUT.minTouchTarget,
                    p: 0,
                    // Mihon's "secondaryItemAlpha"
                    color: (theme) => alpha(theme.palette.m3.onSurfaceVariant, SECONDARY_ALPHA),
                }}
            >
                <ArrowCircleDownOutlinedIcon sx={{ fontSize: DOWNLOAD_INDICATOR_SIZE }} />
            </IconButton>
        </CustomTooltip>
    );
};
