/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { StartSyncResult, SyncState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { SYNC_START_RESULT_TRANSLATION, SYNC_STATE_TRANSLATION } from '@/features/settings/Settings.constants.ts';

/**
 * The sync state and its "Sync now" action, for the app bar's sync button and the library's overflow menu.
 */
export const useStartSync = () => {
    const { t } = useLingui();

    const { data: settingsData } = requestManager.useGetServerSettings();
    const { data: syncStatusData } = requestManager.useGetSyncStatus();

    const syncState = syncStatusData?.lastSyncStatus?.state;
    const isSyncing = !!syncState && ![SyncState.Success, SyncState.Error].includes(syncState);

    const startSync = async () => {
        try {
            const response = await requestManager.startSync().response;
            const result = response.data?.startSync.result;
            if (result) {
                makeToast(
                    t(SYNC_START_RESULT_TRANSLATION[result]),
                    result === StartSyncResult.Success ? 'success' : 'warning',
                );
            }
        } catch (e) {
            makeToast(t`Could not start sync`, 'error', getErrorMessage(e));
        }
    };

    return {
        isEnabled: !!settingsData?.settings.syncYomiEnabled,
        isSyncing,
        /**
         * The running sync's state, e.g. "Syncing…", undefined while no sync runs.
         */
        syncStateTitle: syncState && isSyncing ? t(SYNC_STATE_TRANSLATION[syncState]) : undefined,
        startSync,
    };
};
