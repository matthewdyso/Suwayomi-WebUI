/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { DownloadState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { WavyLinearProgress } from '@/base/components/feedback/WavyProgress.tsx';

/**
 * Wavy while the chapter downloads, flat while it waits in the queue or failed.
 */
export const DownloadStateIndicatorLinear = ({ chapterId }: { chapterId: ChapterIdInfo['id'] }) => {
    const download = Chapters.useDownloadStatusFromCache(chapterId);

    if (!download) {
        return null;
    }

    return (
        <WavyLinearProgress
            value={download.progress * 100}
            amplitude={download.state === DownloadState.Downloading ? undefined : 0}
            sx={download.state === DownloadState.Error ? { color: 'm3.error' } : undefined}
        />
    );
};
