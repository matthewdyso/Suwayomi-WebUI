/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ResumeFab } from '@/features/manga/components/ResumeFAB.tsx';
import {
    filterAndSortChapters,
    isFilterActive,
    updateChapterListOptions,
    useChapterListOptions,
} from '@/features/chapter/utils/ChapterList.util.tsx';
import { ChapterOptions } from '@/features/chapter/components/ChapterOptions.tsx';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { ChaptersToolbarMenu } from '@/features/chapter/components/ChaptersToolbarMenu.tsx';
import { SelectionFAB } from '@/base/collection/components/SelectionFAB.tsx';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';
import type {
    ChapterListFieldsFragment,
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
    MangaScreenFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import { SelectableCollectionSelectAll } from '@/base/collection/components/SelectableCollectionSelectAll.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ChapterActionMenuItems } from '@/features/chapter/components/actions/ChapterActionMenuItems.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/chapter/ChapterQuery.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { shouldForwardProp } from '@/base/utils/ShouldForwardProp.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { ChapterListCard } from '@/features/chapter/components/cards/ChapterListCard.tsx';
import { VirtuosoPersisted } from '@/lib/virtuoso/Component/VirtuosoPersisted.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useElementSize } from '@mantine/hooks';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { useAppBarActionMode } from '@/features/navigation-bar/hooks/useAppBarActionMode.ts';
import { useAppBottomActionMenu } from '@/features/navigation-bar/hooks/useAppBottomActionMenu.ts';
import { ChapterBottomActionMenu } from '@/features/chapter/components/ChapterBottomActionMenu.tsx';

type ChapterListHeaderProps = {
    scrollbarWidth: number;
};
// Mihon's "ChapterHeader"; its icon buttons line up with the trailing buttons of the chapter rows
const ChapterListHeader = styled(Stack, {
    shouldForwardProp: shouldForwardProp<ChapterListHeaderProps>(['scrollbarWidth']),
})<ChapterListHeaderProps>(({ theme, scrollbarWidth }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 1, 0.5, 2),
    [theme.breakpoints.up('md')]: {
        paddingRight: `calc(${scrollbarWidth}px + ${theme.spacing(1)})`,
    },
}));

type StyledVirtuosoProps = { topOffset: number };
const StyledVirtuoso = styled(VirtuosoPersisted, {
    shouldForwardProp: shouldForwardProp<StyledVirtuosoProps>(['topOffset']),
})<StyledVirtuosoProps>(({ theme, topOffset }) => ({
    listStyle: 'none',
    padding: 0,
    [theme.breakpoints.up('md')]: {
        height: `calc(100vh - ${topOffset}px)`,
        margin: 0,
    },
}));

const ChapterListFAB = ({
    selectedChapters,
    firstUnreadChapter,
    onFABMenuClose,
    scrollElement,
    hasBottomActionMenu,
}: {
    selectedChapters: ChapterListFieldsFragment[];
    firstUnreadChapter: ComponentProps<typeof ResumeFab>['chapter'] | null | undefined;
    onFABMenuClose?: () => void;
    scrollElement: ComponentProps<typeof ResumeFab>['scrollElement'];
    /**
     * Phones show the selection's actions in the bottom action menu instead.
     */
    hasBottomActionMenu: boolean;
}) => {
    if (selectedChapters.length) {
        if (hasBottomActionMenu) {
            return null;
        }

        return (
            <SelectionFAB title={plural(selectedChapters.length, { one: '# chapter', other: '# chapters' })}>
                {(handleClose) => (
                    <ChapterActionMenuItems
                        selectedChapters={selectedChapters}
                        onClose={() => {
                            onFABMenuClose?.();
                            handleClose();
                        }}
                    />
                )}
            </SelectionFAB>
        );
    }

    if (firstUnreadChapter) {
        return <ResumeFab chapter={firstUnreadChapter} scrollElement={scrollElement} />;
    }

    return null;
};

export const ChapterList = ({
    manga,
    isRefreshing,
    isSingleColumn,
    areOptionsOpen,
    onOptionsOpenChange,
}: {
    manga: Pick<MangaScreenFieldsFragment, 'id' | 'firstUnreadChapter' | 'chapters' | 'unreadCount' | 'downloadCount'>;
    isRefreshing: boolean;
    /**
     * Phones: the list scrolls with the window below the details, and its actions are in the app bar.
     */
    isSingleColumn: boolean;
    /**
     * The options sheet also opens from the app bar on phones.
     */
    areOptionsOpen: boolean;
    onOptionsOpenChange: (open: boolean) => void;
}) => {
    const { t } = useLingui();
    const { appBarHeight } = useNavBarContext();
    const [virtuosoScrollElement, setVirtuosoScrollElement] = useState<HTMLElement | null | Window>(null);

    const { ref: chapterListHeaderRef, height: chapterListHeaderHeight } = useElementSize();

    const scrollbarYSize = MediaQuery.useGetScrollbarSize('Y', VirtuosoUtil.getScrollElement(virtuosoScrollElement));

    const options = useChapterListOptions(manga);
    const updateOption = updateChapterListOptions(manga, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );
    const {
        data: chaptersData,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetMangaChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
        GET_CHAPTERS_MANGA,
        manga.id,
    );
    const chapters = chaptersData?.chapters.nodes ?? STABLE_EMPTY_ARRAY;

    const visibleChapters = useMemo(() => filterAndSortChapters(chapters, options), [chapters, options]);
    const visibleChapterIds = useMemo(() => Chapters.getIds(visibleChapters), [visibleChapters]);
    const missingChapterCount = useMemo(() => Chapters.getMissingCount(visibleChapters), [visibleChapters]);

    const noChaptersFound = chapters.length === 0;
    const noChaptersMatchingFilter = !noChaptersFound && visibleChapters.length === 0;

    const {
        areNoItemsSelected,
        areAllItemsSelected,
        selectedItemIds,
        handleSelectAll,
        handleSelection,
        clearSelection,
    } = useSelectableCollection(visibleChapterIds.length, { itemIds: visibleChapterIds, currentKey: 'default' });

    const onSelect = useCallback(
        (id: number, selected: boolean, selectRange?: boolean) => handleSelection(id, selected, { selectRange }),
        [handleSelection],
    );

    const selectedChapters = useMemo(
        () => selectedItemIds.map((id) => chapters.find((chapter) => chapter.id === id)).filter((chapter) => !!chapter),
        [selectedItemIds, chapters],
    );

    // phones: Mihon's action-mode toolbar and bottom action menu while chapters are selected
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    useAppBarActionMode(
        isSingleColumn && !areNoItemsSelected
            ? {
                  title: selectedItemIds.length,
                  actions: (
                      <SelectableCollectionSelectAll
                          areAllItemsSelected={areAllItemsSelected}
                          onChange={(checked) => handleSelectAll(checked, checked ? visibleChapterIds : [])}
                      />
                  ),
                  onCancel: clearSelection,
              }
            : null,
        [isSingleColumn, areNoItemsSelected, selectedItemIds.length, areAllItemsSelected, visibleChapterIds],
    );
    useAppBottomActionMenu(
        isMobileWidth && selectedChapters.length ? (
            <ChapterBottomActionMenu
                selectedChapters={selectedChapters}
                allChapters={chapters}
                onDone={clearSelection}
            />
        ) : null,
        [isMobileWidth, selectedChapters, chapters],
    );

    // the sheet also opens from the app bar while the chapters load or failed to load
    const chapterOptions = (
        <ChapterOptions
            open={areOptionsOpen}
            onClose={() => onOptionsOpenChange(false)}
            options={options}
            updateOption={updateOption}
            scanlators={Chapters.getScanlators(chapters)}
            excludedScanlators={options.excludedScanlators}
        />
    );

    if (isLoading || (noChaptersFound && isRefreshing)) {
        return (
            <>
                <Stack sx={{ justifyContent: 'center', alignItems: 'center', position: 'relative', flexGrow: 1 }}>
                    <LoadingPlaceholder />
                </Stack>
                {chapterOptions}
            </>
        );
    }

    if (error) {
        return (
            <>
                <Stack sx={{ justifyContent: 'center', position: 'relative', flexGrow: 1 }}>
                    <EmptyViewAbsoluteCentered
                        message={t`Unable to load data`}
                        messageExtra={getErrorMessage(error)}
                        retry={() => refetch().catch(defaultPromiseErrorHandler('ChapterList::refetch'))}
                    />
                </Stack>
                {chapterOptions}
            </>
        );
    }

    return (
        <>
            <Stack direction="column" sx={{ position: 'relative', flexBasis: '60%' }}>
                <ChapterListHeader ref={chapterListHeaderRef} scrollbarWidth={scrollbarYSize}>
                    {/* on phones the header opens the chapter options (Mihon) */}
                    <Stack
                        {...(isSingleColumn && {
                            component: ButtonBase,
                            onClick: () => onOptionsOpenChange(true),
                            'aria-haspopup': 'dialog',
                        })}
                        sx={{
                            alignItems: 'flex-start',
                            flexGrow: 1,
                            gap: 0.5,
                            minWidth: 0,
                            textAlign: 'start',
                            ...(isSingleColumn && {
                                // the button reaches into the header's padding, so all of it is the touch target
                                alignSelf: 'stretch',
                                justifyContent: 'center',
                                ml: -2,
                                my: -0.5,
                                pl: 2,
                                py: 0.5,
                                ...m3StateLayerSx(),
                            }),
                        }}
                    >
                        {/* a heading can't sit inside a button */}
                        <Typography variant="titleMedium" component={isSingleColumn ? 'span' : 'h3'}>
                            {plural(visibleChapters.length, {
                                one: '# chapter',
                                other: '# chapters',
                            })}
                        </Typography>
                        {!!missingChapterCount && (
                            <Typography variant="bodySmall" noWrap sx={{ color: 'm3.error', opacity: SECONDARY_ALPHA }}>
                                {plural(missingChapterCount, {
                                    one: 'Missing # chapter',
                                    other: 'Missing # chapters',
                                })}
                            </Typography>
                        )}
                    </Stack>

                    {/* on phones the actions are in the app bar, and select all in the selection's action-mode bar */}
                    {!isSingleColumn && (
                        <Stack direction="row">
                            {areNoItemsSelected && (
                                <ChaptersToolbarMenu
                                    manga={manga}
                                    chapters={visibleChapters}
                                    isFiltered={isFilterActive(options)}
                                    onOpenOptions={() => onOptionsOpenChange(true)}
                                />
                            )}
                            {!!visibleChapterIds.length && (
                                <SelectableCollectionSelectAll
                                    areAllItemsSelected={areAllItemsSelected}
                                    onChange={(checked) => handleSelectAll(checked, checked ? visibleChapterIds : [])}
                                />
                            )}
                        </Stack>
                    )}
                </ChapterListHeader>

                {noChaptersFound && <EmptyViewAbsoluteCentered message={t`No chapters found`} />}
                {noChaptersMatchingFilter && <EmptyViewAbsoluteCentered message={t`No chapters matching filter`} />}

                <StyledVirtuoso
                    scrollerRef={setVirtuosoScrollElement}
                    persistKey={`manga-${manga.id}-chapter-list`}
                    topOffset={appBarHeight + chapterListHeaderHeight}
                    style={{
                        // override Virtuoso default values and set them with class
                        height: 'undefined',
                    }}
                    components={{ Footer: () => <Box sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }} /> }}
                    totalCount={visibleChapters.length}
                    computeItemKey={(index) => visibleChapters[index].id}
                    itemContent={(index: number) => (
                        <ChapterListCard
                            index={index}
                            isSortDesc={options.reverse}
                            chapters={visibleChapters}
                            selected={!areNoItemsSelected ? selectedItemIds.includes(visibleChapters[index].id) : null}
                            showChapterNumber={options.showChapterNumber}
                            onSelect={onSelect}
                        />
                    )}
                    useWindowScroll={isSingleColumn}
                    overscan={window.innerHeight * 0.5}
                />
            </Stack>
            {chapterOptions}
            <ChapterListFAB
                selectedChapters={selectedChapters}
                firstUnreadChapter={manga.firstUnreadChapter}
                onFABMenuClose={clearSelection}
                scrollElement={virtuosoScrollElement}
                hasBottomActionMenu={isMobileWidth}
            />
        </>
    );
};
