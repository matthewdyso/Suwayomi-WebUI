/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { useHover } from '@mantine/hooks';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import IconButton from '@mui/material/IconButton';
import { DownloadState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

const DOWNLOAD_STATE_TO_TRANSLATION_MAP: { [state in DownloadState]: MessageDescriptor } = {
    DOWNLOADING: msg`Downloading`,
    ERROR: msg`Error`,
    FINISHED: msg`Finished`,
    QUEUED: msg`Queued`,
} as const;

/**
 * Mihon's chapter download indicators are 26 dp, inside a 48 dp hit box.
 */
export const DOWNLOAD_INDICATOR_SIZE = 26;

const RING_SX = { position: 'absolute', inset: 0, color: 'inherit' } as const;

/**
 * Mihon's "ChapterDownloadIndicator" for chapters in the download queue: a down arrow in a spinning ring while queued,
 * in a wavy progress ring while downloading, a check when finished and an error icon on failure.
 *
 * Clicking it cancels the download (hovering shows the cancel icon).
 */
export const DownloadStateIndicatorCircular = ({
    chapterId,
    color,
}: {
    chapterId: ChapterIdInfo['id'];
    color?: string;
}) => {
    const { t } = useLingui();

    const { ref, hovered } = useHover<HTMLButtonElement>();

    const download = Chapters.useDownloadStatusFromCache(chapterId);

    if (!download) {
        return null;
    }

    const isPartiallyDownloaded = download.progress !== 0;
    const progress = `${Math.round(download.progress * 100)}%`;
    const stateText = t(DOWNLOAD_STATE_TO_TRANSLATION_MAP[download.state]);
    const statusText =
        download.state === DownloadState.Downloading || isPartiallyDownloaded
            ? `${stateText} (${progress})`
            : stateText;

    const stateIndicator = (() => {
        switch (download.state) {
            case DownloadState.Queued:
                return (
                    <>
                        <WavyCircularProgress
                            size={DOWNLOAD_INDICATOR_SIZE}
                            strokeWidth={2}
                            amplitude={0}
                            sx={RING_SX}
                        />
                        <ArrowDownwardRoundedIcon sx={{ fontSize: 14 }} />
                    </>
                );
            case DownloadState.Downloading:
                return (
                    <>
                        <WavyCircularProgress
                            value={download.progress * 100}
                            size={DOWNLOAD_INDICATOR_SIZE}
                            strokeWidth={2}
                            wavelength={7}
                            amplitude={0.6}
                            trackAlpha={0.25}
                            gap={2}
                            sx={RING_SX}
                        />
                        <ArrowDownwardRoundedIcon sx={{ fontSize: 14 }} />
                    </>
                );
            case DownloadState.Finished:
                return <CheckCircleRoundedIcon sx={{ fontSize: DOWNLOAD_INDICATOR_SIZE }} />;
            case DownloadState.Error:
                return <ErrorRoundedIcon sx={{ fontSize: DOWNLOAD_INDICATOR_SIZE, color: 'm3.error' }} />;
            default:
                return null;
        }
    })();

    return (
        // the button cancels the download; its state is the description
        <CustomTooltip title={statusText} describeChild>
            <IconButton
                ref={ref}
                aria-label={t`Cancel download`}
                {...MUIUtil.preventRippleProp()}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    Chapters.cancelDownload([chapterId]);
                }}
                // the same 48 px hit box as the chapter's download button, so the rows' indicators line up
                sx={{
                    width: M3_LAYOUT.minTouchTarget,
                    height: M3_LAYOUT.minTouchTarget,
                    p: 0,
                    color: color ?? 'm3.onSurfaceVariant',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        display: 'grid',
                        placeItems: 'center',
                        width: DOWNLOAD_INDICATOR_SIZE,
                        height: DOWNLOAD_INDICATOR_SIZE,
                    }}
                >
                    {hovered ? <ClearRoundedIcon /> : stateIndicator}
                </Box>
            </IconButton>
        </CustomTooltip>
    );
};
