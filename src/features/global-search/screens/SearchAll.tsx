/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { d } from 'koration';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AppbarSearch } from '@/base/components/AppbarSearch.tsx';
import { useDebounce } from '@/base/hooks/useDebounce.ts';
import type { MangaCardProps, MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { STABLE_EMPTY_ARRAY, STABLE_EMPTY_OBJECT } from '@/base/Base.constants.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { BaseMangaGrid } from '@/features/manga/components/BaseMangaGrid.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Sources } from '@/features/source/services/Sources.ts';
import type {
    SourceDisplayNameInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceMetaInfo,
    SourceNameInfo,
} from '@/features/source/Source.types.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { useFlatAppBar } from '@/features/navigation-bar/hooks/useFlatAppBar.ts';
import { getSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import type { MetadataBrowseSettings } from '@/features/browse/Browse.types.ts';
import { SourceLanguageSelect } from '@/features/source/components/SourceLanguageSelect.tsx';
import { GridLayout, SearchParam } from '@/base/Base.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import type { RouteStateSourcesSearchAll } from '@/features/global-search/SearchAll.types.ts';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import type { TMigratableSource } from '@/features/migration/Migration.types.ts';
import { plural } from '@lingui/core/macro';
import { StickyChipBar } from '@/features/source/components/StickyChipBar.tsx';
import { WavyLinearProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

type SourceLoadingState = { isLoading: boolean; hasResults: boolean; emptySearch: boolean; error: any };
type SourceToLoadingStateMap = Map<string, SourceLoadingState>;

const compareSourceByName = (sourceA: SourceDisplayNameInfo, sourceB: SourceDisplayNameInfo): number =>
    sourceA.displayName.localeCompare(sourceB.displayName);

const compareSourcesBySearchResult = (
    sourceA: SourceIdInfo & SourceMetaInfo,
    sourceB: SourceIdInfo & SourceMetaInfo,
    sourceToFetchedStateMap: SourceToLoadingStateMap,
): -1 | 0 | 1 => {
    const isSourceAPinned = getSourceMetadata(sourceA).isPinned;
    const isSourceBPinned = getSourceMetadata(sourceB).isPinned;

    const sourceAState = sourceToFetchedStateMap.get(sourceA.id);
    const sourceBState = sourceToFetchedStateMap.get(sourceB.id);

    const isSourceAFetched = !sourceAState?.isLoading;
    const hasSourceAError = !!sourceAState?.error;
    const isSourceASearchResultEmpty = !sourceAState?.hasResults && !hasSourceAError;

    const isSourceBFetched = !sourceBState?.isLoading;
    const hasSourceBError = !!sourceBState?.error;
    const isSourceBSearchResultEmpty = !sourceBState?.hasResults && !hasSourceBError;

    if (isSourceAFetched && !isSourceBFetched) {
        return -1;
    }
    if (!isSourceAFetched && isSourceBFetched) {
        return 1;
    }

    if (isSourceASearchResultEmpty && !isSourceBSearchResultEmpty) {
        return 1;
    }
    if (isSourceBSearchResultEmpty && !isSourceASearchResultEmpty) {
        return -1;
    }

    if (!hasSourceAError && hasSourceBError) {
        return -1;
    }
    if (hasSourceAError && !hasSourceBError) {
        return 1;
    }

    if (isSourceAPinned && !isSourceBPinned) {
        return -1;
    }
    if (!isSourceAPinned && isSourceBPinned) {
        return 1;
    }

    return 0;
};
const TRIGGER_SEARCH_THRESHOLD = d(1).seconds.inWholeMilliseconds;

/**
 * Mihon's "GlobalSearchCardRow" cards are 96 dp wide.
 */
const GLOBAL_SEARCH_CARD_WIDTH = 96;

/**
 * Two result cards.
 */
const GLOBAL_SEARCH_LOADING_WIDTH = GLOBAL_SEARCH_CARD_WIDTH * 2;

/**
 * Mihon's global search result states: a loading indicator, "no results" or the error, otherwise the result row.
 */
const SourceSearchPreviewResults = ({
    isLoading,
    error,
    errorMessage,
    retry,
    children,
}: {
    isLoading: boolean;
    error: unknown;
    errorMessage?: string;
    retry: () => void;
    children: React.ReactNode;
}) => {
    const { t } = useLingui();

    if (isLoading) {
        return <WavyLinearProgress sx={{ display: 'block', width: GLOBAL_SEARCH_LOADING_WIDTH, m: 2 }} />;
    }

    if (error) {
        return (
            <Stack sx={{ alignItems: 'start', gap: 0.5, px: 2, py: 1 }}>
                <Typography variant="bodyMedium" sx={{ color: 'm3.error' }}>
                    {errorMessage}
                </Typography>
                <Typography variant="bodySmall" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                    {getErrorMessage(error)}
                </Typography>
                <Button startIcon={<RefreshRoundedIcon />} onClick={retry} sx={{ ml: -1.5 }}>
                    {t`Retry`}
                </Button>
            </Stack>
        );
    }

    if (errorMessage) {
        return (
            <Typography variant="bodyMedium" component="p" sx={{ px: 2, py: 1, color: 'text.secondary' }}>
                {errorMessage}
            </Typography>
        );
    }

    return children;
};

const SourceSearchPreview = React.memo(
    ({
        source,
        onSearchRequestFinished,
        searchString,
        emptyQuery,
        mode,
        shouldShowOnlySourcesWithResults,
        onMigrateSelect,
        mangaId,
        libraryMangaCount,
    }: {
        source: SourceIdInfo & SourceDisplayNameInfo & SourceNameInfo & SourceLanguageInfo;
        onSearchRequestFinished: (source: SourceIdInfo, state: SourceLoadingState) => void;
        searchString: string | null | undefined;
        emptyQuery: boolean;
        mangaId?: MangaIdInfo['id'];
        libraryMangaCount?: number;
    } & Pick<MangaCardProps, 'mode' | 'onMigrateSelect'> &
        Pick<MetadataBrowseSettings, 'shouldShowOnlySourcesWithResults'>) => {
        const { t } = useLingui();

        const { id, name, lang } = source;

        const currentSearchString = useRef(searchString);
        const currentAbortRequest = useRef<(reason: any) => void>(() => {});

        const didSearchChange = currentSearchString.current !== searchString;
        if (didSearchChange) {
            currentSearchString.current = searchString;
            currentAbortRequest.current(new Error(`SourceSearchPreview(${id}, ${name}): search string changed`));
        }

        const [refetch, results] = requestManager.useSourceSearch(id, searchString ?? '', undefined, 1, {
            skipRequest: !searchString,
            addAbortSignal: true,
        });

        const { data: searchResult, isLoading, error, abortRequest } = results[0]!;
        currentAbortRequest.current = abortRequest;

        const tmpMangas = searchResult?.fetchSourceManga?.mangas ?? STABLE_EMPTY_ARRAY;
        const mangas = tmpMangas.filter((manga) => manga.id !== mangaId);
        const noMangasFound = !error && !isLoading && !mangas.length;

        useEffect(() => {
            onSearchRequestFinished(source, {
                isLoading,
                hasResults: !noMangasFound,
                emptySearch: !searchString,
                error,
            });
        }, [isLoading, noMangasFound, searchString, error]);

        useEffect(
            () => () => currentAbortRequest.current?.(new Error(`SourceSearchPreview(${id}, ${name}): search closed`)),
            [],
        );

        let errorMessage: string | undefined;
        if (error) {
            errorMessage = t`Could not search source`;
        } else if (noMangasFound) {
            errorMessage = t`No manga found`;
        }

        if ((!isLoading && !searchString) || emptyQuery) {
            return null;
        }

        if (shouldShowOnlySourcesWithResults && (noMangasFound || error)) {
            return null;
        }

        return (
            <Box sx={{ pb: 1 }}>
                <ButtonBase
                    component={Link}
                    to={AppRoutes.sources.children.browse.path(id, searchString)}
                    state={AppRoutes.sources.children.browse.state({
                        mode,
                        mangaId,
                    })}
                    sx={{
                        width: '100%',
                        justifyContent: 'space-between',
                        gap: 2,
                        pl: 2,
                        pr: 0.5,
                        textAlign: 'start',
                        color: 'm3.onSurface',
                        ...m3StateLayerSx(),
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="titleMedium" component="h2">
                            {name}
                        </Typography>
                        <Typography variant="bodySmall" component="p" sx={{ color: 'text.secondary' }}>
                            {translateExtensionLanguage(lang)}
                            {libraryMangaCount &&
                                ` • ${plural(libraryMangaCount, {
                                    one: '# entry in library',
                                    other: '# entries in library',
                                })}`}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            width: M3_LAYOUT.minTouchTarget,
                            height: M3_LAYOUT.minTouchTarget,
                        }}
                    >
                        <ArrowForwardRoundedIcon />
                    </Box>
                </ButtonBase>
                <SourceSearchPreviewResults
                    isLoading={isLoading}
                    error={error}
                    errorMessage={errorMessage}
                    retry={() =>
                        refetch(1).catch(defaultPromiseErrorHandler(`SourceSearchPreview(${source.id})::refetch`))
                    }
                >
                    <BaseMangaGrid
                        // the key needs to include filters and query to force a re-render of the virtuoso grid to prevent https://github.com/petyosi/react-virtuoso/issues/1242
                        key={searchString}
                        gridWrapperProps={{ sx: { px: 2 } }}
                        mangas={mangas}
                        isLoading={false}
                        hasNextPage={false}
                        loadMore={() => undefined}
                        horizontal
                        itemWidth={GLOBAL_SEARCH_CARD_WIDTH}
                        noFaces
                        gridLayout={GridLayout.Comfortable}
                        inLibraryIndicator
                        mode={mode}
                        onMigrateSelect={onMigrateSelect}
                    />
                </SourceSearchPreviewResults>
            </Box>
        );
    },
);

export const SearchAll = ({
    migrationDestinationSourceIds,
}: {
    migrationDestinationSourceIds?: SourceIdInfo['id'][];
}) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const { state } = useLocation<RouteStateSourcesSearchAll>();

    const { mangaId } = useParams<{ mangaId?: string }>() ?? STABLE_EMPTY_OBJECT;
    const [query] = useQueryParam(SearchParam.QUERY, StringParam);
    const searchString = useDebounce(query, TRIGGER_SEARCH_THRESHOLD);

    const { languages: shownLangs, setLanguages: setShownLangs } = Sources.useLanguages();
    const {
        settings: { showNsfw, shouldShowOnlySourcesWithResults },
    } = useMetadataServerSettings();

    const migratableSourcesRequest = Sources.useGetMigratableSources();
    const { data, loading, error, refetch } = requestManager.useGetSourceList();
    const tmpSources = data?.sources.nodes ?? STABLE_EMPTY_ARRAY;
    const sources = useMemo(
        () =>
            tmpSources.filter(
                (source) => !migrationDestinationSourceIds || migrationDestinationSourceIds.includes(source.id),
            ),
        [tmpSources, migrationDestinationSourceIds],
    );

    const [sourceToLoadingStateMap, setSourceToLoadingStateMap] = useState<SourceToLoadingStateMap>(new Map());
    const debouncedSourceToLoadingStateMap = useDebounce(sourceToLoadingStateMap, 500);

    const sourceLanguages = useMemo(() => Sources.getLanguages(sources, { excludeLocalSource: true }), [sources]);

    const hasPinnedSources = useMemo(() => !!Sources.filter(sources, { pinned: true }).length, [sources]);

    const migratableSourceBySourceId = useMemo(
        () => mapValues((items: TMigratableSource[]) => items[0], groupBy('id', migratableSourcesRequest.sources)),
        [migratableSourcesRequest.sources],
    );
    const {
        title = t`Global Search`,
        shouldShowOnlyPinnedSources = hasPinnedSources,
        mode = 'source',
    } = state ?? STABLE_EMPTY_OBJECT;
    const isMigrateMode = ['migrate.select.single', 'migrate.select.bulk'].includes(mode);

    const filteredSources = useMemo(
        () =>
            Sources.filter(sources, {
                isNsfw: showNsfw ? undefined : false,
                languages: shownLangs,
                keepLocalSource: true,
                pinned: shouldShowOnlyPinnedSources ? true : undefined,
                enabled: true,
            }),
        [sources, shownLangs, shouldShowOnlyPinnedSources],
    );
    const sourcesSortedByName = useMemo(() => [...filteredSources].toSorted(compareSourceByName), [filteredSources]);
    const sourcesSortedByResult = useMemo(
        () =>
            [...sourcesSortedByName].sort((sourceA, sourceB) =>
                compareSourcesBySearchResult(sourceA, sourceB, debouncedSourceToLoadingStateMap),
            ),
        [sourcesSortedByName, debouncedSourceToLoadingStateMap],
    );

    const updateSourceLoadingState = useCallback(
        ({ id }: SourceIdInfo, loadState: SourceLoadingState) => {
            setSourceToLoadingStateMap((currentMap) => {
                const mapCopy = new Map(currentMap);
                mapCopy.set(id, loadState);
                return mapCopy;
            });
        },
        [setSourceToLoadingStateMap],
    );

    const updateMetadataSettings = createUpdateMetadataServerSettings<'shouldShowOnlySourcesWithResults'>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    useFlatAppBar();

    useAppTitleAndAction(
        title,
        <>
            <AppbarSearch searchHistoryKey="globalSearch" isClosable={false} />
            <SourceLanguageSelect
                selectedLanguages={shownLangs}
                setSelectedLanguages={setShownLangs}
                languages={sourceLanguages}
                sources={sources}
            />
        </>,
        [shownLangs, setShownLangs, sourceLanguages, sources],
    );

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SearchAll::refetch'))}
            />
        );
    }

    const showOnlyPinnedSources = (onlyPinned: boolean) =>
        navigate(
            {
                pathname: '',
                search: query ? `query=${query}` : '',
            },
            {
                replace: true,
                state: {
                    ...state,
                    ...AppRoutes.sources.children.searchAll.state({
                        shouldShowOnlyPinnedSources: onlyPinned,
                    }),
                },
            },
        );

    return (
        <Box sx={{ position: 'relative', pb: 1 }}>
            <StickyChipBar>
                {hasPinnedSources && (
                    <>
                        <Chip
                            icon={<PushPinRoundedIcon />}
                            variant={shouldShowOnlyPinnedSources ? 'filled' : 'outlined'}
                            label={t`Pinned`}
                            onClick={() => showOnlyPinnedSources(true)}
                        />
                        <Chip
                            icon={<DoneAllRoundedIcon />}
                            variant={!shouldShowOnlyPinnedSources ? 'filled' : 'outlined'}
                            label={t`All`}
                            onClick={() => showOnlyPinnedSources(false)}
                        />
                        <Divider orientation="vertical" flexItem />
                    </>
                )}
                <Chip
                    icon={<FilterListRoundedIcon />}
                    variant={shouldShowOnlySourcesWithResults ? 'filled' : 'outlined'}
                    label={t`Has results`}
                    onClick={() =>
                        updateMetadataSettings('shouldShowOnlySourcesWithResults', !shouldShowOnlySourcesWithResults)
                    }
                />
            </StickyChipBar>
            <Box sx={{ pt: 1 }}>
                {sourcesSortedByResult.map((source) => (
                    <SourceSearchPreview
                        key={source.id}
                        source={source}
                        onSearchRequestFinished={updateSourceLoadingState}
                        searchString={searchString}
                        emptyQuery={!query}
                        mode={mode}
                        shouldShowOnlySourcesWithResults={shouldShowOnlySourcesWithResults}
                        onMigrateSelect={
                            isMigrateMode
                                ? (match) => {
                                      assertIsDefined(mangaId);
                                      MigrationManager.selectManualMatch(Number(mangaId), {
                                          ...match,
                                          sourceTitle: Sources.getFromCache(match.sourceId)?.displayName,
                                          latestChapterNumber: undefined,
                                      });
                                      ReactRouter.navigate(AppRoutes.migrate.path);
                                  }
                                : undefined
                        }
                        libraryMangaCount={migratableSourceBySourceId[source.id]?.mangaCount}
                        mangaId={mangaId ? Number(mangaId) : undefined}
                    />
                ))}
            </Box>
        </Box>
    );
};
