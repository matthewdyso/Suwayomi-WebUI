/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { SearchTextField } from '@/base/components/inputs/SearchTextField.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { TrackerMangaCard } from '@/features/tracker/components/cards/TrackerMangaCard.tsx';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { MangaIdInfo, MangaTitleInfo } from '@/features/manga/Manga.types.ts';

import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import type { TrackerIdInfo, TTrackerBind } from '@/features/tracker/Tracker.types.ts';
import { Tracker } from '@/features/tracker/Tracker.types.ts';
import { CustomIconButton } from '@/base/components/buttons/CustomIconButton.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

const TrackButton = ({
    mangaId,
    selectedTrackerRemoteId,
    trackerId,
    closeSearchMode,
    supportsPrivateTracking,
}: {
    trackerId: TrackerIdInfo['id'];
    mangaId: MangaIdInfo['id'];
    selectedTrackerRemoteId: string | undefined;
    closeSearchMode: () => void;
    supportsPrivateTracking: boolean;
}) => {
    const { t } = useLingui();
    const [bindTracker, bindTrackerMutation] = requestManager.useBindTracker();

    const trackManga = (asPrivate: boolean) => {
        if (selectedTrackerRemoteId === undefined) {
            return;
        }

        bindTracker({
            variables: { input: { mangaId, remoteId: selectedTrackerRemoteId, trackerId, private: asPrivate } },
        })
            .then(() => {
                makeToast(t`Tracked manga`, 'success');
                closeSearchMode();
            })
            .catch((e) => makeToast(t`Could not track manga`, 'error', getErrorMessage(e)));
    };

    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: 'center',
                position: 'sticky',
                bottom: 0,
                gap: 2,
                p: 2,
                bgcolor: 'm3.surfaceContainerHigh',
            }}
        >
            <Button
                disabled={bindTrackerMutation.loading}
                size="large"
                variant="contained"
                onClick={() => trackManga(false)}
                sx={{ flexBasis: '65%' }}
            >
                {t`Track`}
            </Button>
            {supportsPrivateTracking && (
                <CustomTooltip title={t`Track privately`} disabled={bindTrackerMutation.loading}>
                    <CustomIconButton
                        disabled={bindTrackerMutation.loading}
                        sx={{ flexBasis: '10%', maxWidth: '100px' }}
                        variant="contained"
                        onClick={() => trackManga(true)}
                    >
                        <VisibilityOffRoundedIcon />
                    </CustomIconButton>
                </CustomTooltip>
            )}
        </Stack>
    );
};

export const TrackerSearch = ({
    manga,
    tracker,
    closeSearchMode,
    trackedId,
    trackedTitle,
}: {
    manga: MangaIdInfo & MangaTitleInfo;
    tracker: TTrackerBind;
    closeSearchMode: () => void;
    trackedId?: string;
    trackedTitle?: string;
}) => {
    const { t } = useLingui();
    const getOptionForDirection = useGetOptionForDirection();

    const [searchString, setSearchString] = useState<string>(trackedTitle ?? manga.title);
    const [tmpSearchString, setTmpSearchString] = useState(searchString);

    const [selectedTrackerRemoteId, setSelectedTrackerRemoteId] = useState<string | undefined>(trackedId);

    const trackerSearch = requestManager.useTrackerSearch(tracker.id, searchString);
    const searchResults = trackerSearch.data?.searchTracker.trackSearches ?? STABLE_EMPTY_ARRAY;

    const hasResults = !!searchResults.length;
    const hasNoResults = !trackerSearch.loading && !trackerSearch.error && !hasResults;
    const hasError = !!trackerSearch.error && !trackerSearch.loading;

    useEffect(() => {
        setSelectedTrackerRemoteId(trackedId);

        return () =>
            trackerSearch.abortRequest(new Error(`MangaTrackerSearchCard(${tracker.id}, ${manga.id}): search changed`));
    }, [searchString]);

    const showTrackButton =
        useMemo(
            () =>
                !!selectedTrackerRemoteId &&
                !!searchResults.find((searchResult) => searchResult.remoteId === selectedTrackerRemoteId),
            [selectedTrackerRemoteId, searchResults],
        ) && !hasError;

    return (
        <Stack sx={{ minHeight: '100%' }}>
            {/* stays on top of the results that scroll in the sheet */}
            <Stack
                direction="row"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    gap: 1,
                    alignItems: 'center',
                    p: 1,
                    pr: 2,
                    bgcolor: 'm3.surfaceContainerHigh',
                }}
            >
                <IconButton onClick={closeSearchMode} aria-label={t`Exit to previous page`}>
                    {getOptionForDirection(<ArrowBackRoundedIcon />, <ArrowForwardRoundedIcon />)}
                </IconButton>
                <SearchTextField
                    sx={{ width: '100%' }}
                    variant="standard"
                    value={tmpSearchString}
                    onChange={(e) => setTmpSearchString(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setSearchString(tmpSearchString);
                        }
                    }}
                    onCancel={() => setTmpSearchString('')}
                    slotProps={{
                        input: {
                            startAdornment: tracker.id === Tracker.MYANIMELIST && (
                                <InputAdornment position="start">
                                    <PopupState variant="popover" popupId="tracker-search-info">
                                        {(popupState) => (
                                            <>
                                                <IconButton {...bindTrigger(popupState)} color="inherit">
                                                    <InfoRoundedIcon />
                                                </IconButton>
                                                <Popover
                                                    {...bindPopover(popupState)}
                                                    anchorOrigin={{
                                                        vertical: 'bottom',
                                                        horizontal: 'left',
                                                    }}
                                                >
                                                    <Typography sx={{ padding: 1, whiteSpace: 'pre-line' }}>
                                                        {t`Search for a ID via "id:<ID>" (e.g. "id:13")\nLimit search to your lists via "my:<Title>" (e.g. "my:One Piece")`}
                                                    </Typography>
                                                </Popover>
                                            </>
                                        )}
                                    </PopupState>
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Stack>
            <Box sx={{ position: 'relative', flexGrow: 1, minHeight: '50vh' }}>
                {hasNoResults && <EmptyViewAbsoluteCentered message={t`No manga found`} />}
                {trackerSearch.loading && <LoadingPlaceholder />}
                {hasError && (
                    <EmptyViewAbsoluteCentered
                        message={t`Unable to load data`}
                        messageExtra={getErrorMessage(trackerSearch.error)}
                        retry={() =>
                            trackerSearch.refetch().catch(defaultPromiseErrorHandler('TrackerSearch::refetch'))
                        }
                    />
                )}
                {hasResults &&
                    searchResults.map((trackerManga) => (
                        <TrackerMangaCard
                            key={trackerManga.id}
                            manga={trackerManga}
                            selected={trackerManga.remoteId === selectedTrackerRemoteId}
                            onSelect={() => setSelectedTrackerRemoteId(trackerManga.remoteId)}
                        />
                    ))}
            </Box>
            {showTrackButton && (
                <TrackButton
                    mangaId={manga.id}
                    trackerId={tracker.id}
                    closeSearchMode={closeSearchMode}
                    selectedTrackerRemoteId={selectedTrackerRemoteId}
                    supportsPrivateTracking={tracker.supportsPrivateTracking}
                />
            )}
        </Stack>
    );
};
