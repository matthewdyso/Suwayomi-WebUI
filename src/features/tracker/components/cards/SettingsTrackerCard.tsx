/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ListItemButton from '@mui/material/ListItemButton';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ListItemText from '@mui/material/ListItemText';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import type { TTrackerSearch } from '@/features/tracker/Tracker.types.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TrackerLogo } from '@/features/tracker/components/TrackerLogo.tsx';
import { CredentialsLogin } from '@/base/components/modals/LoginDialog.tsx';

export const SettingsTrackerCard = ({ tracker }: { tracker: TTrackerSearch }) => {
    const { t } = useLingui();

    const isOAuthLogin = !tracker.isLoggedIn && !!tracker.authUrl;

    const handleLogout = async () => {
        try {
            await requestManager.logoutFromTracker(tracker.id).response;
        } catch (e) {
            makeToast(t`Could not log out from ${tracker.name}`, 'error', getErrorMessage(e));
        }
    };

    const handleLogin = async (username: string, password: string) => {
        if (isOAuthLogin) {
            const state = {
                redirectUrl: `${window.location.origin}/tracker/login/oauth`,
                clientName: 'Suwayomi-WebUI',
                trackerId: tracker.id,
                trackerName: tracker.name,
            };

            window.open(`${tracker.authUrl}&state=${JSON.stringify(state)}`, '_self');
            return;
        }

        try {
            await requestManager.loginTrackerCredentials(tracker.id, username, password).response;
        } catch (e) {
            makeToast(t`Could not log in to ${tracker.name}`, 'error', getErrorMessage(e));
        }
    };

    const login = async (initialUsername?: string, initialPassword?: string) => {
        if (isOAuthLogin) {
            const state = {
                redirectUrl: `${window.location.origin}/tracker/login/oauth`,
                clientName: 'Suwayomi-WebUI',
                trackerId: tracker.id,
                trackerName: tracker.name,
            };

            window.open(`${tracker.authUrl}&state=${JSON.stringify(state)}`, '_self');
            return;
        }

        const controlled = CredentialsLogin.showControlled(
            {
                title: Trackers.isLoggedIn(tracker) ? t`Log out from ${tracker.name}` : t`Log in to ${tracker.name}`,
                isLoading: false,
                isLoggedIn: Trackers.isLoggedIn(tracker),
                username: initialUsername,
                password: initialPassword,
                loginLogout: async (username, password) => {
                    controlled.update({
                        isLoading: true,
                        loginLogout: noOp,
                    });

                    if (Trackers.isLoggedIn(tracker)) {
                        try {
                            await handleLogout();

                            controlled.submit();
                        } catch (e) {
                            makeToast(t`Could not log out from ${tracker.name}`, 'error', getErrorMessage(e));
                        }

                        return;
                    }

                    try {
                        await handleLogin(username, password);

                        controlled.submit();
                    } catch (e) {
                        makeToast(t`Could not log in to ${tracker.name}`, 'error', getErrorMessage(e));

                        const RETRY_KEY = '__retry__';
                        const retry = await Promise.race([controlled.promise, Promise.resolve(RETRY_KEY)]);
                        if (retry === RETRY_KEY) {
                            login(username, password);
                        }
                    }
                },
            },
            { id: 'tracker-login-dialog' },
        );

        await controlled.promise;
    };

    return (
        <ListItemButton onClick={() => login()} sx={{ gap: 2 }}>
            <TrackerLogo name={tracker.name} icon={tracker.icon} />
            <ListItemText primary={tracker.name} slotProps={{ primary: { variant: 'titleMedium' } }} />
            {Trackers.isLoggedIn(tracker) && (
                <CustomTooltip title={t`Logged in`}>
                    <CheckRoundedIcon aria-label={t`Logged in`} sx={{ fontSize: 32, color: 'm3.primary' }} />
                </CustomTooltip>
            )}
        </ListItemButton>
    );
};
