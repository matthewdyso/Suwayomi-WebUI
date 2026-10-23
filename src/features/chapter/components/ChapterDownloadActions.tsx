/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DownloadStateIndicatorCircular } from '@/base/components/downloads/DownloadStateIndicatorCircular.tsx';
import { ChapterDownloadButton } from '@/features/chapter/components/buttons/ChapterDownloadButton.tsx';
import { ChapterDownloadRetryButton } from '@/features/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import type { ChapterDownloadInfo, ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

/**
 * The trailing download controls of an update or history row: download, the queue state (cancels on click) or retry,
 * and optionally a check for downloaded chapters.
 */
export const ChapterDownloadActions = ({
    chapter,
    showDownloaded,
}: {
    chapter: ChapterIdInfo & ChapterDownloadInfo;
    showDownloaded?: boolean;
}) => (
    <>
        <DownloadStateIndicatorCircular chapterId={chapter.id} />
        <ChapterDownloadRetryButton chapterId={chapter.id} />
        <ChapterDownloadButton
            chapterId={chapter.id}
            isDownloaded={chapter.isDownloaded}
            showDownloaded={showDownloaded}
        />
    </>
);
