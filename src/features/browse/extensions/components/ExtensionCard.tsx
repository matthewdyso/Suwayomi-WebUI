/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { useLingui } from '@lingui/react/macro';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { InstalledStates, TExtension } from '@/features/extension/Extensions.types.ts';
import { ExtensionAction, ExtensionState } from '@/features/extension/Extensions.types.ts';
import {
    EXTENSION_ACTION_TO_NEXT_ACTION_MAP,
    EXTENSION_ACTION_TO_STATE_MAP,
    INSTALLED_STATE_TO_TRANSLATION_MAP,
} from '@/features/extension/Extensions.constants.ts';
import { getInstalledState, isNsfw, updateExtension } from '@/features/extension/Extensions.utils.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { SourceIcon } from '@/features/source/components/SourceIcon.tsx';
import { ExtensionPill } from '@/features/extension/components/ExtensionPill.tsx';

const ICON_SIZE = 40;
/**
 * Mihon shrinks the icon into the progress ring while an extension is being installed, updated or uninstalled.
 */
const BUSY_ICON_SIZE = 24;

const BUSY_STATES: InstalledStates[] = [
    ExtensionState.INSTALLING,
    ExtensionState.UPDATING,
    ExtensionState.UNINSTALLING,
];

interface IProps {
    extension: TExtension;
    handleUpdate: () => void;
    showSourceStore: boolean;
    forcedState?: ExtensionState;
}

/**
 * Mihon's "ExtensionItem": icon, name, "language • version" with pills for what's notable, and the action icons.
 */
export function ExtensionCard(props: IProps) {
    const { t } = useLingui();

    const {
        extension: {
            name,
            lang,
            versionName,
            isInstalled,
            hasUpdate,
            isObsolete,
            pkgName,
            iconUrl,
            contentWarning,
            extensionStore,
        },
        handleUpdate,
        showSourceStore,
        forcedState,
    } = props;
    const [localInstalledState, setInstalledState] = useState<InstalledStates>(
        getInstalledState(isInstalled, isObsolete, hasUpdate),
    );
    const installedState = forcedState ?? localInstalledState;
    const isBusy = BUSY_STATES.includes(installedState);

    useEffect(() => {
        setInstalledState(getInstalledState(isInstalled, isObsolete, hasUpdate));
    }, [getInstalledState(isInstalled, isObsolete, hasUpdate)]);

    const requestExtensionAction = async (action: ExtensionAction): Promise<void> => {
        const nextAction = EXTENSION_ACTION_TO_NEXT_ACTION_MAP[action];
        const state = EXTENSION_ACTION_TO_STATE_MAP[action];

        try {
            setInstalledState(state);

            await updateExtension(pkgName, isObsolete, action);

            setInstalledState(nextAction);

            handleUpdate();
        } catch (_) {
            setInstalledState(getInstalledState(isInstalled, isObsolete, hasUpdate));
        }
    };

    // Mihon's list only installs and updates; uninstalling is on the extension's details screen
    const downloadAction =
        installedState === ExtensionAction.INSTALL || installedState === ExtensionAction.UPDATE ? installedState : null;
    const handleDownload = () => {
        if (!downloadAction) {
            return;
        }

        requestExtensionAction(downloadAction).catch(
            defaultPromiseErrorHandler(`ExtensionCard:handleDownload(${downloadAction})`),
        );
    };

    const facts = [
        showSourceStore && extensionStore?.name,
        isInstalled && languageCodeToName(lang),
        versionName,
    ].filter(Boolean);

    return (
        <ListRow
            minHeight={64}
            leading={
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: ICON_SIZE,
                        height: ICON_SIZE,
                    }}
                >
                    {isBusy && <WavyCircularProgress size={ICON_SIZE} sx={{ position: 'absolute', inset: 0 }} />}
                    <SourceIcon iconUrl={iconUrl} alt={name} size={isBusy ? BUSY_ICON_SIZE : ICON_SIZE} />
                </Box>
            }
            headline={name}
            headlineVariant="bodyMedium"
            supportingVariant="bodySmall"
            supporting={
                <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
                    {!!facts.length && <span>{facts.join(' • ')}</span>}
                    {isBusy && (
                        <ExtensionPill color="primary">
                            {t(INSTALLED_STATE_TO_TRANSLATION_MAP[installedState])}
                        </ExtensionPill>
                    )}
                    {isObsolete && <ExtensionPill color="error">{t`Obsolete`}</ExtensionPill>}
                    {isNsfw(contentWarning) && <ExtensionPill color="error">18+</ExtensionPill>}
                </Box>
            }
            to={isInstalled ? AppRoutes.extension.children.info.path(pkgName) : undefined}
            onClick={isInstalled || isBusy ? undefined : handleDownload}
            trailing={
                !isBusy && (
                    <>
                        {isInstalled && (
                            <CustomTooltip title={t`Settings`}>
                                <IconButton component={Link} to={AppRoutes.extension.children.info.path(pkgName)}>
                                    <SettingsRoundedIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        {downloadAction && (
                            <CustomTooltip title={t(INSTALLED_STATE_TO_TRANSLATION_MAP[downloadAction])}>
                                <IconButton
                                    aria-label={t(INSTALLED_STATE_TO_TRANSLATION_MAP[downloadAction])}
                                    onClick={handleDownload}
                                >
                                    <DownloadRoundedIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                    </>
                )
            }
        />
    );
}
