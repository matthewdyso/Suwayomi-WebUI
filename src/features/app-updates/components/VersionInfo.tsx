/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { t } from '@lingui/core/macro';
import { UpdateState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';

export type BaseVersionInfoProps = {
    title: string;
    version: string;
    isCheckingForUpdate: boolean;
    isUpdateAvailable: boolean;
    updateCheckError: any;
    checkForUpdate: () => void;
};
export type LinkVersionInfoProps = {
    downloadAsLink: true;
    url: string;
};
export type TriggerVersionInfoProps = {
    triggerUpdate: () => void;
    updateState: UpdateState;
    progress: number;
};
export type VersionInfoProps =
    | (BaseVersionInfoProps & PropertiesNever<TriggerVersionInfoProps> & LinkVersionInfoProps)
    | (BaseVersionInfoProps & TriggerVersionInfoProps & PropertiesNever<LinkVersionInfoProps>);

// as large as the icons it takes the place of
const PROGRESS_SIZE = 24;

const getUpdateCheckIcon = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    updateState?: UpdateState,
    progress: number = 0,
    asLink: boolean = false,
) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;
    if (isUpdateInProgress) {
        return <WavyCircularProgress value={progress} size={PROGRESS_SIZE} />;
    }

    if (isLoading) {
        return <WavyCircularProgress size={PROGRESS_SIZE} />;
    }

    const isRefreshRequired = !isUpdateAvailable || updateState === UpdateState.Error;
    if (isRefreshRequired) {
        return <RefreshRoundedIcon />;
    }

    return asLink ? <OpenInNewRoundedIcon /> : <DownloadRoundedIcon />;
};

const getUpdateCheckText = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    error: any,
    updateState?: UpdateState,
    progress: number = 0,
) => {
    const isUpdating = updateState === UpdateState.Downloading;
    if (isUpdating) {
        return t`${progress}% | Updating…`;
    }

    const didUpdateFail = updateState === UpdateState.Error;
    if (didUpdateFail) {
        return t`Update failed`;
    }

    if (isLoading) {
        return t`Checking for update`;
    }

    if (error) {
        return t`Could not check for update`;
    }

    if (isUpdateAvailable) {
        return t`Update available`;
    }

    return t`This is the latest version`;
};

/**
 * Preference row with the version as its subtitle and the update state below it. Clicking it checks for an update,
 * or starts or opens the available one.
 */
export const VersionInfo = ({
    title,
    version,
    isCheckingForUpdate,
    isUpdateAvailable,
    updateCheckError,
    checkForUpdate,
    triggerUpdate,
    updateState,
    progress,
    downloadAsLink,
    url,
}: VersionInfoProps) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;
    const opensUrl = !!url && isUpdateAvailable;

    const onClick = () => {
        if (isUpdateInProgress) {
            return;
        }

        const shouldCheckForUpdate = !isUpdateAvailable || updateCheckError || updateState === UpdateState.Error;
        if (shouldCheckForUpdate) {
            checkForUpdate();
            return;
        }

        if (isUpdateAvailable) {
            triggerUpdate?.();
        }
    };

    const content = (
        <>
            <ListItemText
                primary={title}
                secondary={
                    <>
                        <span>{version}</span>
                        <span>
                            {getUpdateCheckText(
                                isCheckingForUpdate,
                                isUpdateAvailable,
                                updateCheckError,
                                updateState,
                                progress,
                            )}
                        </span>
                    </>
                }
                slotProps={{ secondary: { sx: { display: 'flex', flexDirection: 'column' } } }}
            />
            <Box
                sx={{
                    display: 'flex',
                    ml: 2,
                    color: isUpdateAvailable ? 'm3.primary' : 'm3.onSurfaceVariant',
                }}
            >
                {getUpdateCheckIcon(isCheckingForUpdate, isUpdateAvailable, updateState, progress, downloadAsLink)}
            </Box>
        </>
    );

    return (
        <ListItem disablePadding disableGutters>
            {opensUrl ? (
                <ListItemButton component="a" href={url} target="_blank" rel="noreferrer">
                    {content}
                </ListItemButton>
            ) : (
                <ListItemButton onClick={onClick} aria-busy={isCheckingForUpdate || isUpdateInProgress}>
                    {content}
                </ListItemButton>
            )}
        </ListItem>
    );
};
