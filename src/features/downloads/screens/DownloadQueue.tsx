/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useMemo, useRef, useState } from 'react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useWindowEvent } from '@mantine/hooks';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { ChapterDownloadReorderInput } from '@/lib/graphql/generated/graphql-base.types.ts';
import { DownloadState, DownloaderState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { coerceIn, getErrorMessage } from '@/lib/HelperFunctions.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';
import { DownloadQueueChapterCard } from '@/features/downloads/components/DownloadQueueChapterCard.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useAppAction } from '@/features/navigation-bar/hooks/useAppAction.ts';
import type { ChapterDownloadStatus } from '@/features/chapter/Chapter.types.ts';
import { VirtuosoPersisted } from '@/lib/virtuoso/Component/VirtuosoPersisted.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import groupBy from 'lodash/fp/groupBy';
import uniqBy from 'lodash/fp/uniqBy';
import mapValues from 'lodash/fp/mapValues';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { DownloadGroupHeader } from '@/features/downloads/components/DownloadGroupHeader.tsx';
import { plural } from '@lingui/core/macro';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { useOffsetComponent } from '@/base/OffsetComponent.tsx';
import { Pill, PILL_FONT_SIZE } from '@/base/components/badges/Pill.tsx';
import { DEFAULT_FULL_FAB_HEIGHT, StyledFab } from '@/base/components/buttons/StyledFab.tsx';
import { useFabExpanded } from '@/base/hooks/useFabExpanded.ts';

export const DownloadQueue: React.FC = () => {
    const { t } = useLingui();

    const { topOffset } = useOffsetComponent();

    const [reorderDownloadsMutation] = requestManager.useReorderChaptersInDownloadQueue();

    const {
        data: downloadStatusData,
        loading: isLoading,
        dataState,
        error,
        refetch,
    } = requestManager.useGetDownloadStatus();
    const downloaderData = downloadStatusData?.downloadStatus;

    const queue = downloaderData?.queue ?? STABLE_EMPTY_ARRAY;
    const status = downloaderData?.state ?? DownloaderState.Started;
    const isQueueEmpty = !queue.length;
    const isDownloaderRunning = status === DownloaderState.Started;
    const toggleQueueStatusLabel = isDownloaderRunning ? t`Pause` : t`Resume`;

    useAppTitle(
        // Mihon centers the count pill vertically next to the title
        <Stack component="span" sx={{ flexDirection: 'row', alignItems: 'center', minWidth: 0 }}>
            {t`Download queue`}
            {!isQueueEmpty && (
                <Pill variant="onSurface" fontSize={PILL_FONT_SIZE.title}>
                    {queue.length}
                </Pill>
            )}
        </Stack>,
        t`Download queue`,
        [t, queue.length],
    );

    const isFabExpanded = useFabExpanded();

    const groupHeaderElementBySourceRef = useRef(new Map<SourceIdInfo['id'], Element | null>());

    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveSource, setDndActiveSource] = useState<any>(null);
    const [dndActiveDownload, setDndActiveDownload] = useState<ChapterDownloadStatus | null>(null);

    const sources = useMemo(
        () =>
            uniqBy(
                'id',
                queue.map(
                    (download) =>
                        download.manga.source ?? {
                            id: download.manga.sourceId,
                            name: download.manga.sourceId,
                            lang: undefined,
                        },
                ),
            ),
        [queue],
    );
    const downloadsBySource = useMemo(() => groupBy((download) => download.manga.sourceId, queue), [queue]);
    const chaptersByManga = useMemo(
        () =>
            mapValues(
                (downloads: ChapterDownloadStatus[]) => downloads.map((download) => download.chapter),
                groupBy((download) => download.manga.id, queue),
            ),
        [queue],
    );
    const chaptersBySource = useMemo(
        () => mapValues((downloads) => downloads.map((download) => download.chapter), downloadsBySource),
        [downloadsBySource],
    );

    const failedDownloadChapterIds = useMemo(
        () => queue.filter((item) => item.state === DownloadState.Error).map((item) => item.chapter.id),
        [queue],
    );

    const retryDownloads = async () => {
        try {
            await Chapters.download(failedDownloadChapterIds);
        } catch (e) {
            makeToast(t`Could not retry failed downloads`, 'error', getErrorMessage(e));
        }
    };

    const clearQueue = async () => {
        try {
            await requestManager.clearDownloads().response;
        } catch (e) {
            makeToast(t`Could not remove all downloads from the queue`, 'error', getErrorMessage(e));
        }
    };

    const toggleQueueStatus = () => {
        if (status === DownloaderState.Stopped) {
            requestManager.startDownloads();
        } else {
            requestManager.stopDownloads();
        }
    };

    const downloadReorder = (list: ChapterDownloadStatus[], reorders: ChapterDownloadReorderInput[]) => {
        const isOrderUnchanged = reorders.every(
            (reorder) => list.findIndex((item) => item.chapter.id === reorder.chapterId) === reorder.to,
        );
        if (isOrderUnchanged) {
            return;
        }

        return reorderDownloadsMutation({ variables: { input: { reorders } } }).catch((e) => {
            makeToast(
                plural(reorders.length, {
                    one: 'Could not reorder download',
                    other: 'Could not reorder downloads',
                }),
                'error',
                getErrorMessage(e),
            );
        });
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveDownload(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = queue.findIndex((download) => download.chapter.id === active.id);
        const newIndex = queue.findIndex((download) => download.chapter.id === over.id);

        downloadReorder(queue, [{ chapterId: queue[oldIndex].chapter.id, to: newIndex }]);
    };

    const onDragEndSource = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveSource(null);

        if (!over || active.id === over.id) {
            return;
        }

        const newIndex = queue.findIndex((item) => item.manga.sourceId === over.id);

        downloadReorder(
            queue,
            chaptersBySource[active.id as SourceIdInfo['id']].map((chapter, index) => ({
                chapterId: chapter.id,
                to: coerceIn(newIndex + index, 0, queue.length - 1),
            })),
        )?.then(() => {
            requestAnimationFrame(() => {
                groupHeaderElementBySourceRef.current.get(active.id as SourceIdInfo['id'])?.scrollIntoView();
                window.scrollBy({ top: -topOffset });
            });
        });
    };

    const reorderDownloads = (download: ChapterDownloadStatus, mode: 'top' | 'bottom', series?: boolean) => {
        const chapters = series ? chaptersByManga[download.manga.id] : [download.chapter];
        const sourceDownloads = downloadsBySource[download.manga.sourceId];

        const newIndex = (() => {
            const [firstSourceDownload] = sourceDownloads;
            const lastSourceDownload = sourceDownloads[sourceDownloads.length - 1];

            const firstSourceDownloadIndex = queue.indexOf(firstSourceDownload);
            const lastSourceDownloadIndex = queue.indexOf(lastSourceDownload);

            if (mode === 'top') {
                const isFirstSourceDownloadOfSeries = firstSourceDownload.manga.id === download.manga.id;

                return isFirstSourceDownloadOfSeries ? 0 : firstSourceDownloadIndex;
            }

            return lastSourceDownloadIndex;
        })();

        const reorders = chapters.map((chapter, index) => ({
            chapterId: chapter.id,
            to: coerceIn(newIndex + index, 0, queue.length - 1),
        }));

        downloadReorder(queue, reorders);
    };

    const cancelDownloads = (download: ChapterDownloadStatus, series?: boolean) => {
        const chapters = series ? chaptersByManga[download.manga.id] : [download.chapter];

        Chapters.cancelDownload(Chapters.getIds(chapters));
    };

    useAppAction(
        isQueueEmpty ? null : (
            <PopupState variant="popover" popupId="download-queue-actions">
                {(popupState) => (
                    <>
                        <CustomTooltip title={t`Options`}>
                            <IconButton {...bindTrigger(popupState)} color="inherit" aria-label={t`Options`}>
                                <MoreVertRoundedIcon />
                            </IconButton>
                        </CustomTooltip>
                        <Menu {...bindMenu(popupState)}>
                            <MenuItem
                                disabled={!failedDownloadChapterIds.length}
                                onClick={() => {
                                    popupState.close();
                                    retryDownloads();
                                }}
                            >
                                {t`Retry all`}
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    popupState.close();
                                    clearQueue();
                                }}
                            >
                                {t`Delete all`}
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </PopupState>
        ),
        [t, isQueueEmpty, failedDownloadChapterIds.length],
    );

    // Virtuoso's resize observer can throw this error,
    // which is caught by DnD and aborts dragging.
    useWindowEvent('error', (e) => {
        if (
            e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
            e.message === 'ResizeObserver loop limit exceeded'
        ) {
            e.stopImmediatePropagation();
        }
    });

    if (isLoading && dataState !== 'complete') {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadQueue::refetch'))}
            />
        );
    }

    if (isQueueEmpty) {
        return <EmptyViewAbsoluteCentered message={t`No downloads`} />;
    }

    return (
        <Box sx={{ pb: DEFAULT_FULL_FAB_HEIGHT }}>
            <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragStart={(event) =>
                    setDndActiveSource(sources.find((source) => source.id === event.active.id) ?? null)
                }
                onDragEnd={onDragEndSource}
                onDragCancel={() => setDndActiveSource(null)}
                onDragAbort={() => setDndActiveSource(null)}
            >
                <SortableContext items={sources} strategy={verticalListSortingStrategy}>
                    {sources.map((source) => (
                        <DndSortableItem
                            key={`source-${source.id}`}
                            id={source.id}
                            isDragging={source.id === dndActiveSource?.id}
                        >
                            <DownloadGroupHeader
                                ref={(e) => {
                                    groupHeaderElementBySourceRef.current.set(source.id, e);
                                }}
                                title={source.name}
                                itemCount={chaptersBySource[source.id].length}
                                language={source.lang ? languageCodeToName(source.lang) : undefined}
                            />
                            <DndContext
                                sensors={dndSensors}
                                collisionDetection={closestCenter}
                                onDragStart={(event) =>
                                    setDndActiveDownload(
                                        queue.find((download) => download.chapter.id === event.active.id) ?? null,
                                    )
                                }
                                onDragEnd={onDragEnd}
                                onDragCancel={() => setDndActiveDownload(null)}
                                onDragAbort={() => setDndActiveDownload(null)}
                            >
                                <SortableContext
                                    items={chaptersBySource[source.id]}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <VirtuosoPersisted
                                        persistKey={`download-queue-${source.id}`}
                                        useWindowScroll
                                        totalCount={!dndActiveSource ? chaptersBySource[source.id].length : 0}
                                        computeItemKey={(index) =>
                                            `source-${source.id}-chapter-${chaptersBySource[source.id][index].id}`
                                        }
                                        itemContent={(index) => (
                                            <DndSortableItem
                                                id={chaptersBySource[source.id][index].id}
                                                isDragging={
                                                    chaptersBySource[source.id][index].id ===
                                                    dndActiveDownload?.chapter.id
                                                }
                                            >
                                                <DownloadQueueChapterCard
                                                    item={downloadsBySource[source.id][index]}
                                                    reorderDownloads={reorderDownloads}
                                                    cancelDownloads={cancelDownloads}
                                                />
                                            </DndSortableItem>
                                        )}
                                    />
                                </SortableContext>
                                <DndOverlayItem isActive={!!dndActiveDownload}>
                                    <DownloadQueueChapterCard
                                        item={dndActiveDownload!}
                                        reorderDownloads={reorderDownloads}
                                        cancelDownloads={cancelDownloads}
                                        isDragOverlay
                                    />
                                </DndOverlayItem>
                            </DndContext>
                        </DndSortableItem>
                    ))}
                </SortableContext>
                <DndOverlayItem isActive={!!dndActiveSource}>
                    <DownloadGroupHeader
                        title={dndActiveSource?.name}
                        itemCount={chaptersBySource[dndActiveSource?.id]?.length ?? -1}
                        language={dndActiveSource?.lang ? languageCodeToName(dndActiveSource.lang) : undefined}
                        isDragOverlay
                    />
                </DndOverlayItem>
            </DndContext>
            <StyledFab
                variant={isFabExpanded ? 'extended' : 'circular'}
                onClick={toggleQueueStatus}
                aria-label={toggleQueueStatusLabel}
            >
                {isDownloaderRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                {isFabExpanded && toggleQueueStatusLabel}
            </StyledFab>
        </Box>
    );
};
