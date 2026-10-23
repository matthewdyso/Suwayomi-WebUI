/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { WAVY_ICON_PROGRESS_PROPS, WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { dateTimeFormatter } from '@/base/utils/DateHelper.ts';
import type { CategoryIdInfo } from '@/features/category/Category.types.ts';

import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppBarProgress } from '@/features/navigation-bar/hooks/useAppBarProgress.ts';

let lastRunningState = false;

export type GlobalUpdateControls = {
    isRunning: boolean;
    /**
     * Starts an update of the library or the category, or stops the running update.
     */
    toggle: (categoryId?: CategoryIdInfo['id']) => void;
};

/**
 * The global update's button. "children" replaces the button, e.g. with menu entries (Mihon's library overflow menu
 * on phones); the checker still tracks the running update and its progress bar.
 */
export function UpdateChecker({
    categoryId,
    handleFinishedUpdate,
    children,
}: {
    categoryId?: CategoryIdInfo['id'];
    handleFinishedUpdate?: () => void;
    children?: (controls: GlobalUpdateControls) => ReactNode;
}) {
    const { t } = useLingui();

    const { data: lastUpdateTimestampData, refetch: reFetchLastTimestamp } =
        requestManager.useGetLastGlobalUpdateTimestamp();

    const { data: updaterData } = requestManager.useGetGlobalUpdateSummary();
    const status = updaterData?.libraryUpdateStatus;

    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;
    const date = lastUpdateTimestamp ? dateTimeFormatter.format(+lastUpdateTimestamp) : '-';

    const isRunning = !!status?.jobsInfo.isRunning;
    const progress = status ? (status.jobsInfo.finishedJobs / status.jobsInfo.totalJobs) * 100 : 0;

    // the button's tooltip names the action, the bar along the app bar's bottom edge reports the progress
    useAppBarProgress(isRunning ? { value: progress, 'aria-label': t`Global update` } : null);

    useEffect(() => {
        if (!lastRunningState && isRunning) {
            lastRunningState = true;
        }

        const isUpdateFinished = lastRunningState && progress === 100;
        if (!isUpdateFinished) {
            return;
        }

        lastRunningState = false;
        handleFinishedUpdate?.();
        // this re-fetch is necessary since a running update could have been triggered by the server or another client
        reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
    }, [isRunning]);

    const startUpdate = async (category?: CategoryIdInfo['id']) => {
        try {
            lastRunningState = true;
            await requestManager.startGlobalUpdate(category !== undefined ? [category] : undefined).response;
            reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
        } catch (e) {
            lastRunningState = false;
            makeToast(t`Could not check for updates`, 'error', getErrorMessage(e));
        }
    };

    const stopUpdate = async () => {
        try {
            await requestManager.resetGlobalUpdate();
        } catch (e) {
            makeToast(t`Could not stop global update`, 'error', getErrorMessage(e));
        }
    };

    const onClick = async (category?: CategoryIdInfo['id']) => {
        if (isRunning) {
            stopUpdate();
        } else {
            startUpdate(category);
        }
    };

    if (children) {
        return children({
            isRunning,
            toggle: (category) => {
                onClick(category).catch(defaultPromiseErrorHandler('UpdateChecker::toggle'));
            },
        });
    }

    return (
        <PopupState variant="popover" popupId="library-update-checker-menu">
            {(popupState) => (
                <>
                    <CustomTooltip title={isRunning ? t`Stop global update` : t`Global update (last update: ${date})`}>
                        <IconButton
                            {...(categoryId !== undefined && !isRunning
                                ? bindTrigger(popupState)
                                : { onClick: () => onClick() })}
                            color="inherit"
                        >
                            {!isRunning ? (
                                <RefreshRoundedIcon />
                            ) : (
                                <Box
                                    aria-hidden
                                    sx={{
                                        position: 'relative',
                                        display: 'grid',
                                        placeItems: 'center',
                                        width: WAVY_ICON_PROGRESS_PROPS.size,
                                        height: WAVY_ICON_PROGRESS_PROPS.size,
                                    }}
                                >
                                    <WavyCircularProgress
                                        {...WAVY_ICON_PROGRESS_PROPS}
                                        value={progress}
                                        gap={2}
                                        sx={{ position: 'absolute', inset: 0 }}
                                    />
                                    <ClearRoundedIcon sx={{ fontSize: 16 }} />
                                </Box>
                            )}
                        </IconButton>
                    </CustomTooltip>
                    <Menu {...bindMenu(popupState)}>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick();
                            }}
                        >
                            {t`Update library`}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick(categoryId);
                            }}
                        >
                            {t`Update category`}
                        </MenuItem>
                    </Menu>
                </>
            )}
        </PopupState>
    );
}
