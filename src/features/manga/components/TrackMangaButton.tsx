/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { TrackManga } from '@/features/tracker/components/TrackManga.tsx';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import type { GetTrackersSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/tracker/TrackerQuery.ts';
import type { MangaTitleInfo, MangaTrackRecordInfo } from '@/features/manga/Manga.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { AdaptiveSheet } from '@/base/components/modals/AdaptiveSheet.tsx';
import { MangaActionButton } from '@/features/manga/components/details/MangaActionButton.tsx';

export const TrackMangaButton = ({ manga }: { manga: MangaTrackRecordInfo & MangaTitleInfo }) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const popupState = usePopupState({ variant: 'dialog', popupId: 'manga-track-modal' });

    const trackerList = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS);
    const trackers = trackerList.data?.trackers.nodes ?? STABLE_EMPTY_ARRAY;
    const mangaTrackers = manga.trackRecords.nodes;

    const loggedInTrackers = Trackers.getLoggedIn(trackers);
    const trackersInUse = Trackers.getLoggedIn(Trackers.getTrackers(mangaTrackers, trackers));
    const isTracked = !!trackersInUse.length;

    const handleClick = () => {
        if (trackerList.error) {
            makeToast(t`Could not load track info`, 'error', trackerList.error?.toString());
            return;
        }

        if (!loggedInTrackers.length) {
            navigate(AppRoutes.settings.children.tracking.path);
            return;
        }

        popupState.open();
    };

    return (
        <>
            <MangaActionButton
                active={isTracked}
                icon={isTracked ? <DoneRoundedIcon /> : <SyncRoundedIcon />}
                label={
                    isTracked
                        ? plural(trackersInUse.length, {
                              one: '# Tracker',
                              other: '# Tracker',
                          })
                        : t`Tracking`
                }
                disabled={trackerList.loading || !!trackerList.error}
                onClick={handleClick}
            />
            <AdaptiveSheet open={popupState.isOpen} onClose={popupState.close}>
                <TrackManga manga={manga} />
            </AdaptiveSheet>
        </>
    );
};
