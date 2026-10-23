/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Link } from 'react-router-dom';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { IconWebView } from '@/assets/icons/IconWebView.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';

/**
 * Mihon's "BrowseSourceToolbar" overflow: open the source in WebView and its settings.
 */
export const SourceBrowseOverflowMenu = ({
    sourceId,
    homeUrl,
    isConfigurable,
}: {
    sourceId: SourceIdInfo['id'];
    homeUrl?: string | null;
    isConfigurable?: boolean;
}) => {
    const { t } = useLingui();
    const popupState = usePopupState({ variant: 'popover', popupId: 'source-browse-overflow-menu' });

    return (
        <>
            <CustomTooltip title={t`More`}>
                <IconButton {...bindTrigger(popupState)} edge="end" color="inherit">
                    <MoreVertRoundedIcon />
                </IconButton>
            </CustomTooltip>
            <Menu {...bindMenu(popupState)}>
                <MenuItem
                    component="a"
                    disabled={!homeUrl}
                    href={homeUrl ? requestManager.getWebviewUrl(homeUrl) : undefined}
                    rel="noreferrer"
                    target="_blank"
                    onClick={popupState.close}
                >
                    <ListItemIcon>
                        <IconWebView />
                    </ListItemIcon>
                    <ListItemText primary={t`Open in WebView`} />
                </MenuItem>
                {isConfigurable && (
                    <MenuItem
                        component={Link}
                        to={AppRoutes.sources.children.configure.path(sourceId)}
                        onClick={popupState.close}
                    >
                        <ListItemIcon>
                            <SettingsRoundedIcon />
                        </ListItemIcon>
                        <ListItemText primary={t`Settings`} />
                    </MenuItem>
                )}
            </Menu>
        </>
    );
};
