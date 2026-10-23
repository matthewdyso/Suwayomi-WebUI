/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { memo, useMemo, useRef } from 'react';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { DownloadStateIndicatorCircular } from '@/base/components/downloads/DownloadStateIndicatorCircular.tsx';
import { ReaderLibraryButton } from '@/features/reader/overlay/navigation/components/ReaderLibraryButton.tsx';
import { ReaderBookmarkButton } from '@/features/reader/overlay/navigation/components/ReaderBookmarkButton.tsx';
import { CHAPTER_ACTION_TO_TRANSLATION, FALLBACK_CHAPTER } from '@/features/chapter/Chapter.constants.ts';
import { IconBrowser } from '@/assets/icons/IconBrowser.tsx';
import { IconWebView } from '@/assets/icons/IconWebView.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    getReaderPagesStore,
    useReaderChaptersStore,
    useReaderPagesStore,
    useReaderStore,
} from '@/features/reader/stores/ReaderStore.ts';
import type { ChapterDownloadInfo, ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import { ShareGuard } from '@/base/components/guard/ShareGuard.tsx';

const DownloadButton = ({ id = -1, isDownloaded }: ChapterIdInfo & ChapterDownloadInfo) => {
    const { t } = useLingui();

    const downloadStatus = Chapters.useDownloadStatusFromCache(id);

    const isDisabled = id === undefined;

    if (id !== undefined && isDownloaded) {
        return (
            <CustomTooltip title={t(CHAPTER_ACTION_TO_TRANSLATION.delete.action.single)}>
                <IconButton onClick={() => Chapters.performAction('delete', [id], {})} color="inherit">
                    <DeleteRoundedIcon />
                </IconButton>
            </CustomTooltip>
        );
    }

    if (downloadStatus) {
        return <DownloadStateIndicatorCircular chapterId={downloadStatus.chapter.id} />;
    }

    return (
        <CustomTooltip title={t(CHAPTER_ACTION_TO_TRANSLATION.download.action.single)} disabled={isDisabled}>
            <IconButton
                disabled={isDisabled}
                onClick={() => Chapters.performAction('download', [id], {})}
                color="inherit"
            >
                <DownloadRoundedIcon />
            </IconButton>
        </CustomTooltip>
    );
};

export const ReaderNavBarDesktopActions = memo(() => {
    const mangaTitle = useReaderStore((state) => state.manga?.title);
    const { id, name, isDownloaded, isBookmarked, realUrl } = useReaderChaptersStore((state) => ({
        id: state.currentChapter?.id ?? FALLBACK_CHAPTER.id,
        name: state.currentChapter?.name ?? FALLBACK_CHAPTER.name,
        isDownloaded: state.currentChapter?.isDownloaded ?? FALLBACK_CHAPTER.isDownloaded,
        isBookmarked: state.currentChapter?.isBookmarked ?? FALLBACK_CHAPTER.isBookmarked,
        realUrl: state.currentChapter?.realUrl ?? FALLBACK_CHAPTER.realUrl,
    }));

    const { t } = useLingui();
    const pageLoadStates = useReaderPagesStore('pageLoadStates');

    const pageRetryKeyPrefix = useRef<number>(0);

    const haveSomePagesFailedToLoad = useMemo(
        () => pageLoadStates.some((pageLoadState) => pageLoadState.error),
        [pageLoadStates],
    );

    return (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'center' }}>
            <ReaderLibraryButton />
            <ReaderBookmarkButton id={id} isBookmarked={isBookmarked} />
            <CustomTooltip title={t`Retry errored pages`} disabled={!haveSomePagesFailedToLoad}>
                <IconButton
                    onClick={() => {
                        getReaderPagesStore().setPageLoadStates((statePageLoadStates) =>
                            statePageLoadStates.map((pageLoadState) => ({
                                url: pageLoadState.url,
                                loaded: pageLoadState.loaded,
                            })),
                        );
                        getReaderPagesStore().setRetryFailedPagesKeyPrefix(`${pageRetryKeyPrefix.current}`);
                        pageRetryKeyPrefix.current = (pageRetryKeyPrefix.current + 1) % 1000;
                    }}
                    disabled={!haveSomePagesFailedToLoad}
                    color="inherit"
                >
                    <ReplayRoundedIcon />
                </IconButton>
            </CustomTooltip>
            <DownloadButton id={id} isDownloaded={isDownloaded} />
            <CustomTooltip title={t`Open in browser`} disabled={!realUrl}>
                <IconButton disabled={!realUrl} href={realUrl ?? ''} rel="noreferrer" target="_blank" color="inherit">
                    <IconBrowser />
                </IconButton>
            </CustomTooltip>
            <CustomTooltip title={t`Open in WebView`} disabled={!realUrl}>
                <IconButton
                    disabled={!realUrl}
                    href={realUrl ? requestManager.getWebviewUrl(realUrl) : ''}
                    rel="noreferrer"
                    target="_blank"
                    color="inherit"
                >
                    <IconWebView />
                </IconButton>
            </CustomTooltip>
            <ShareGuard>
                <CustomTooltip title={t`Share`} disabled={!realUrl}>
                    <IconButton
                        color="inherit"
                        disabled={!realUrl}
                        onClick={() =>
                            navigator
                                .share({
                                    title: `${mangaTitle} — ${name}`,
                                    url: realUrl ?? undefined,
                                })
                                .catch(defaultPromiseErrorHandler('MangaToolbarMenu::share'))
                        }
                    >
                        <ShareRoundedIcon />
                    </IconButton>
                </CustomTooltip>
            </ShareGuard>
        </Stack>
    );
});
