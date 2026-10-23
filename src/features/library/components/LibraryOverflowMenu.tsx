/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { useStartSync } from '@/features/sync/hooks/useStartSync.ts';

/**
 * Mihon's library overflow menu: the actions that don't fit into the app bar on a phone (and sync, when it's enabled).
 * Updating the category stays in the update button's menu, which tracks the running update.
 */
export const LibraryOverflowMenu = ({ mangas, onSelectAll }: { mangas: MangaIdInfo[]; onSelectAll: () => void }) => {
    const { t } = useLingui();
    const sync = useStartSync();

    const openRandomManga = () => {
        try {
            const randomManga = mangas[Math.floor(Math.random() * mangas.length)];

            assertIsDefined(randomManga);

            ReactRouter.navigate(AppRoutes.manga.path(randomManga.id));
        } catch (e) {
            makeToast(t`Could not open random entry`, 'error', getErrorMessage(e));
        }
    };

    return (
        <PopupState variant="popover" popupId="library-overflow-menu">
            {(popupState) => {
                const runAndClose = (action: () => void) => () => {
                    popupState.close();
                    action();
                };

                return (
                    <>
                        <CustomTooltip title={t`More`}>
                            <IconButton {...bindTrigger(popupState)} color="inherit">
                                <MoreVertRounded />
                            </IconButton>
                        </CustomTooltip>
                        <Menu {...bindMenu(popupState)}>
                            <MenuItem disabled={!mangas.length} onClick={runAndClose(openRandomManga)}>
                                {t`Open random entry`}
                            </MenuItem>
                            {sync.isEnabled && (
                                <MenuItem disabled={sync.isSyncing} onClick={runAndClose(sync.startSync)}>
                                    {sync.syncStateTitle ?? t`Sync now`}
                                </MenuItem>
                            )}
                            <MenuItem disabled={!mangas.length} onClick={runAndClose(onSelectAll)}>
                                {t`Select all`}
                            </MenuItem>
                        </Menu>
                    </>
                );
            }}
        </PopupState>
    );
};
