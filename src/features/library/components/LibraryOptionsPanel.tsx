/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import Chip from '@mui/material/Chip';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { OptionsTabs } from '@/base/components/modals/OptionsTabs.tsx';
import {
    CheckboxItem,
    HeadingItem,
    SliderItem,
    SortItem,
    TriStateItem,
} from '@/base/components/settings/SheetRows.tsx';
import { ChipRow } from '@/base/components/chips/ChipRow.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import type { GetTrackersSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { MangaStatus } from '@/lib/graphql/generated/graphql-base.types.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import {
    batchUpdateCategoryMetadata,
    createUpdateCategoryMetadata,
    useGetCategoryMetadata,
} from '@/features/category/services/CategoryMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { MANGA_GRID_WIDTH, SERVER_SETTINGS_METADATA_DEFAULT } from '@/features/settings/Settings.constants.ts';
import { FilterMode, type LibrarySortMode } from '@/features/library/Library.types.ts';
import type { CategoryMetadataInfo, ICategoryMetadata } from '@/features/category/Category.types.ts';
import { MANGA_STATUS_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import { GridLayout, type ValueToDisplayData } from '@/base/Base.types';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Collapsable } from '@/base/components/Collapsable.tsx';
import { ResetButton } from '@/base/components/buttons/ResetButton.tsx';
import Replay from '@mui/icons-material/Replay';
import { Sources } from '@/features/source/services/Sources';
import Stack from '@mui/material/Stack';
import { ValueRotationButton } from '@/base/components/buttons/ValueRotationButton.tsx';

const TITLES: { [key in 'filter' | 'sort' | 'display']: MessageDescriptor } = {
    filter: msg`Filter`,
    sort: msg`Sort`,
    display: msg`Display`,
};

const SORT_OPTIONS: [LibrarySortMode, MessageDescriptor][] = [
    ['unreadChapters', msg`Unread chapters`],
    ['totalChapters', msg`Total chapters`],
    ['alphabetically', msg`A—Z`],
    ['dateAdded', msg`Recently added`],
    ['lastRead', msg`Recently read`],
    ['latestFetchedChapter', msg`Latest fetched chapter`],
    ['latestUploadedChapter', msg`Latest uploaded chapter`],
    ['random', msg`Random`],
];

const FILTER_MODE_DISPLAY_DATA: ValueToDisplayData<FilterMode> = {
    [FilterMode.AND]: {
        title: msg`and`,
        icon: null,
    },
    [FilterMode.OR]: {
        title: msg`or`,
        icon: null,
    },
};

const FILTER_MODES = Object.values(FilterMode);

const DISPLAY_MODES: [GridLayout, MessageDescriptor][] = [
    [GridLayout.Compact, msg`Compact grid`],
    [GridLayout.Comfortable, msg`Comfortable grid`],
    [GridLayout.List, msg`List`],
];

const useUpdateDisplaySetting = () => {
    const { t } = useLingui();

    return createUpdateMetadataServerSettings((e) =>
        makeToast(t`Could not save the default search settings to the server`, 'error', getErrorMessage(e)),
    );
};

/**
 * The value of a single thumb slider (MUI types it for range sliders too).
 */
const getSingleSliderValue = (value: number | number[]): number => (Array.isArray(value) ? value[0] : value);

/**
 * Commits the width once the slider is released; the value shown while dragging is local.
 */
const ItemWidthSliderItem = () => {
    const { t } = useLingui();

    const {
        settings: { mangaGridItemWidth },
    } = useMetadataServerSettings();
    const updateSetting = useUpdateDisplaySetting();

    const [draggedWidth, setDraggedWidth] = useState<number>();
    const itemWidth = draggedWidth ?? mangaGridItemWidth;

    const commit = (width: number) =>
        updateSetting('mangaGridItemWidth', width).finally(() => setDraggedWidth(undefined));

    return (
        <SliderItem
            label={t`Manga item width`}
            value={`${itemWidth}${t`px`}`}
            onDefault={
                mangaGridItemWidth !== SERVER_SETTINGS_METADATA_DEFAULT.mangaGridItemWidth
                    ? () => commit(SERVER_SETTINGS_METADATA_DEFAULT.mangaGridItemWidth)
                    : undefined
            }
            slotProps={{
                slider: {
                    value: itemWidth,
                    min: MANGA_GRID_WIDTH.min,
                    max: MANGA_GRID_WIDTH.max,
                    step: MANGA_GRID_WIDTH.step,
                    onChange: (_, value) => setDraggedWidth(getSingleSliderValue(value)),
                    onChangeCommitted: (_, value) => commit(getSingleSliderValue(value)),
                },
            }}
        />
    );
};

const CollapsableFilter = ({
    title,
    items,
    isActive,
    reset,
    mode,
    setMode,
}: {
    title: string;
    items: ReactNode[];
    isActive: boolean;
    reset: () => void;
    mode?: FilterMode;
    setMode?: (mode: FilterMode) => void;
}) => {
    const { t } = useLingui();

    return (
        <Collapsable
            header={
                <Typography variant="header" component="span">
                    {title}
                </Typography>
            }
            headerEnd={
                <Stack sx={{ flexGrow: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                    {mode && !!setMode && (
                        <ValueRotationButton
                            tooltip={t`Filter mode`}
                            value={mode}
                            values={FILTER_MODES}
                            setValue={setMode}
                            valueToDisplayData={FILTER_MODE_DISPLAY_DATA}
                            slots={{
                                button: {
                                    base: {
                                        size: 'small',
                                        variant: 'outlined',
                                        sx: { flexGrow: 0, justifyContent: 'center', textTransform: 'uppercase' },
                                    },
                                },
                            }}
                        />
                    )}
                    <ResetButton
                        asIconButton
                        disabled={!isActive}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            reset();
                        }}
                    />
                </Stack>
            }
            collapse={items}
            initialState={isActive}
            slots={{
                headerContainer: {
                    sx: {
                        minHeight: 48,
                        px: 3,
                        flexWrap: 'wrap',
                        color: isActive ? 'm3.active' : 'm3.onSurfaceVariant',
                    },
                },
                headerWrapper: {
                    sx: {
                        alignItems: 'center',
                    },
                },
            }}
        />
    );
};

export const LibraryOptionsPanel = ({
    category,
    open,
    onClose,
    active,
    isStatusFilterActive,
    isTrackerFilterActive,
    isSourceFilterActive,
}: {
    category: CategoryMetadataInfo;
    open: boolean;
    onClose: () => void;
    active: boolean;
    isStatusFilterActive: boolean;
    isTrackerFilterActive: boolean;
    isSourceFilterActive: boolean;
}) => {
    const { t } = useLingui();

    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);
    const loggedInTrackers = Trackers.getLoggedIn(trackerList.data?.trackers.nodes ?? STABLE_EMPTY_ARRAY);

    const { sources: librarySources } = Sources.useGetMigratableSources();

    const categoryLibraryOptions = useGetCategoryMetadata(category);
    const updateCategoryLibraryOptions = createUpdateCategoryMetadata(category, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const {
        settings: { showTabSize, showContinueReadingButton, showDownloadBadge, showUnreadBadge, gridLayout },
    } = useMetadataServerSettings();
    const setSettingValue = useUpdateDisplaySetting();

    const resetFilters = (
        deleteKeys: (keyof ICategoryMetadata)[] = [
            'hasUnreadChapters',
            'hasReadChapters',
            'hasDownloadedChapters',
            'hasBookmarkedChapters',
            'hasDuplicateChapters',
            'hasStatus',
            'hasTrackerBinding',
            'hasSource',
        ],
    ) => {
        batchUpdateCategoryMetadata([
            {
                categories: [category],
                delete: deleteKeys,
            },
        ]).catch((e) => makeToast(t`Could not reset filters`, 'error', getErrorMessage(e)));
    };

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => t(TITLES[key])}
            tabRowEnd={
                <ResetButton
                    asIconButton
                    disabled={!active}
                    onClick={() => resetFilters()}
                    sx={{ color: active ? 'm3.active' : 'm3.onSurfaceVariant', mr: 0.5 }}
                />
            }
            tabContent={(key) => {
                if (key === 'filter') {
                    return (
                        <>
                            <TriStateItem
                                label={t`Downloaded`}
                                checked={categoryLibraryOptions.hasDownloadedChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasDownloadedChapters', c)}
                            />
                            <TriStateItem
                                label={t`Unread`}
                                checked={categoryLibraryOptions.hasUnreadChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasUnreadChapters', c)}
                            />
                            <TriStateItem
                                label={t`Started`}
                                checked={categoryLibraryOptions.hasReadChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasReadChapters', c)}
                            />
                            <TriStateItem
                                label={t`Bookmarked`}
                                checked={categoryLibraryOptions.hasBookmarkedChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasBookmarkedChapters', c)}
                            />
                            <TriStateItem
                                label={t`Duplicate chapters`}
                                checked={categoryLibraryOptions.hasDuplicateChapters}
                                onChange={(c) => updateCategoryLibraryOptions('hasDuplicateChapters', c)}
                            />
                            <CollapsableFilter
                                title={t`Status`}
                                items={Object.values(MangaStatus).map((status) => (
                                    <TriStateItem
                                        key={status}
                                        label={t(MANGA_STATUS_TO_TRANSLATION[status])}
                                        checked={categoryLibraryOptions.hasStatus[status]}
                                        onChange={(checked) =>
                                            updateCategoryLibraryOptions('hasStatus', {
                                                ...categoryLibraryOptions.hasStatus,
                                                [status]: checked,
                                            })
                                        }
                                    />
                                ))}
                                isActive={isStatusFilterActive}
                                reset={() => resetFilters(['hasStatus'])}
                            />
                            {!!loggedInTrackers.length && (
                                <CollapsableFilter
                                    title={t`Tracked`}
                                    items={loggedInTrackers.map((tracker) => (
                                        <TriStateItem
                                            key={tracker.id}
                                            label={tracker.name}
                                            checked={categoryLibraryOptions.hasTrackerBinding.filters[tracker.id]}
                                            onChange={(checked) =>
                                                updateCategoryLibraryOptions('hasTrackerBinding', {
                                                    ...categoryLibraryOptions.hasTrackerBinding,
                                                    filters: {
                                                        ...categoryLibraryOptions.hasTrackerBinding.filters,
                                                        [tracker.id]: checked,
                                                    },
                                                })
                                            }
                                        />
                                    ))}
                                    isActive={isTrackerFilterActive}
                                    reset={() => resetFilters(['hasTrackerBinding'])}
                                    mode={categoryLibraryOptions.hasTrackerBinding.mode}
                                    setMode={(mode) =>
                                        updateCategoryLibraryOptions('hasTrackerBinding', {
                                            ...categoryLibraryOptions.hasTrackerBinding,
                                            mode,
                                        })
                                    }
                                />
                            )}
                            {!!librarySources.length && (
                                <CollapsableFilter
                                    title={t`Source`}
                                    items={librarySources.map((source) => (
                                        <TriStateItem
                                            key={source.id}
                                            label={source.displayName ?? source.id}
                                            checked={categoryLibraryOptions.hasSource[source.id]}
                                            onChange={(checked) =>
                                                updateCategoryLibraryOptions('hasSource', {
                                                    ...categoryLibraryOptions.hasSource,
                                                    [source.id]: checked,
                                                })
                                            }
                                        />
                                    ))}
                                    isActive={isSourceFilterActive}
                                    reset={() => resetFilters(['hasSource'])}
                                />
                            )}
                        </>
                    );
                }
                if (key === 'sort') {
                    return (
                        <RadioGroup value={categoryLibraryOptions.sortBy}>
                            {SORT_OPTIONS.map(([mode, label]) => (
                                <SortItem
                                    key={mode}
                                    label={t(label)}
                                    value={mode}
                                    checked={categoryLibraryOptions.sortBy === mode}
                                    checkedIcon={mode === 'random' ? <Replay color="primary" /> : undefined}
                                    sortDescending={categoryLibraryOptions.sortDesc}
                                    onClick={() =>
                                        mode !== categoryLibraryOptions.sortBy
                                            ? updateCategoryLibraryOptions('sortBy', mode)
                                            : updateCategoryLibraryOptions('sortDesc', !categoryLibraryOptions.sortDesc)
                                    }
                                />
                            ))}
                        </RadioGroup>
                    );
                }
                if (key === 'display') {
                    const activeGridLayout = gridLayout ?? GridLayout.Compact;

                    return (
                        <>
                            <HeadingItem>{t`Display mode`}</HeadingItem>
                            <ChipRow wrap sx={{ px: 3, pb: 1.25 }}>
                                {DISPLAY_MODES.map(([layout, label]) => {
                                    const isSelected = activeGridLayout === layout;

                                    return (
                                        <Chip
                                            key={layout}
                                            label={t(label)}
                                            variant={isSelected ? 'filled' : 'outlined'}
                                            aria-pressed={isSelected}
                                            onClick={() => setSettingValue('gridLayout', layout)}
                                        />
                                    );
                                })}
                            </ChipRow>
                            {activeGridLayout !== GridLayout.List && <ItemWidthSliderItem />}
                            <HeadingItem>{t`Overlay`}</HeadingItem>
                            <CheckboxItem
                                label={t`Download badges`}
                                checked={showDownloadBadge}
                                onChange={() => setSettingValue('showDownloadBadge', !showDownloadBadge)}
                            />
                            <CheckboxItem
                                label={t`Unread badges`}
                                checked={showUnreadBadge}
                                onChange={() => setSettingValue('showUnreadBadge', !showUnreadBadge)}
                            />
                            <CheckboxItem
                                label={t`Show continue reading button`}
                                checked={showContinueReadingButton}
                                onChange={() =>
                                    setSettingValue('showContinueReadingButton', !showContinueReadingButton)
                                }
                            />
                            <HeadingItem>{t`Tabs`}</HeadingItem>
                            <CheckboxItem
                                label={t`Show number of items`}
                                checked={showTabSize}
                                onChange={() => setSettingValue('showTabSize', !showTabSize)}
                            />
                        </>
                    );
                }
                return null;
            }}
        />
    );
};
