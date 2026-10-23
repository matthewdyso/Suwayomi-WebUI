/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { useLingui } from '@lingui/react/macro';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { PreferenceList } from '@/features/settings/components/PreferenceList.tsx';

/**
 * Mihon's settings categories have a subtitle naming what's inside; here built from the pages' own section and setting
 * titles.
 */
const joinSubtitle = (parts: string[]): string => parts.join(', ');

export function Settings() {
    const { t } = useLingui();

    useAppTitle(t`Settings`);

    return (
        <PreferenceList>
            <ListItemLink to={AppRoutes.settings.children.appearance.path}>
                <ListItemIcon>
                    <PaletteOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`Appearance`} secondary={joinSubtitle([t`Theme`, t`Display`, t`Language`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.reader.path}>
                <ListItemIcon>
                    <ChromeReaderModeOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t`Reader`}
                    secondary={joinSubtitle([t`Reading mode`, t`Layout`, t`Behaviour`])}
                />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.library.path}>
                <ListItemIcon>
                    <CollectionsBookmarkOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`Library`} secondary={joinSubtitle([t`Categories`, t`Global update`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.download.path}>
                <ListItemIcon>
                    <DownloadOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t`Downloads`}
                    secondary={joinSubtitle([t`Delete chapters`, t`Auto-download`, t`Download ahead`])}
                />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.images.path}>
                <ListItemIcon>
                    <ImageOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`Images`} secondary={joinSubtitle([t`Image processing`, t`Clear cache`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.tracking.path}>
                <ListItemIcon>
                    <SyncOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`Tracking`} secondary={joinSubtitle([t`Trackers`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.backup.path}>
                <ListItemIcon>
                    <StorageOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t`Backup`}
                    secondary={joinSubtitle([t`Create backup`, t`Restore Backup`, t`Automated backup`])}
                />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.browse.path}>
                <ListItemIcon>
                    <ExploreOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t`Browse`}
                    secondary={joinSubtitle([t`Sources`, t`Extension stores`, t`NSFW (18+) sources`])}
                />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.history.path}>
                <ListItemIcon>
                    <HistoryOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`History`} secondary={joinSubtitle([t`Hide history`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.device.path}>
                <ListItemIcon>
                    <DevicesOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`Device`} secondary={joinSubtitle([t`Devices`, t`Active device`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.webui.path}>
                <ListItemIcon>
                    <WebOutlinedIcon />
                </ListItemIcon>
                <ListItemText primary={t`WebUI`} secondary={joinSubtitle([t`Flavor`, t`Interface`, t`Channel`])} />
            </ListItemLink>
            <ListItemLink to={AppRoutes.settings.children.server.path}>
                <ListItemIcon>
                    <DnsOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t`Server`}
                    secondary={joinSubtitle([
                        t`Server bindings`,
                        t`SOCKS proxy`,
                        t`Authentication`,
                        t`Cloudflare bypass`,
                    ])}
                />
            </ListItemLink>
        </PreferenceList>
    );
}
