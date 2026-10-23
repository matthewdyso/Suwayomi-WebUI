/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React from 'react';
import { Link } from 'react-router-dom';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import { AwaitableComponent } from 'awaitable-component';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { CategorySelect } from '@/features/category/components/CategorySelect.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { ThemeCreationDialog } from '@/features/theme/components/CreateThemeDialog.tsx';
import type {
    MangaIdInfo,
    MangaInLibraryInfo,
    MangaMetaInfo,
    MangaSourceIdInfo,
    MangaTitleInfo,
    MangaUrlInfo,
} from '@/features/manga/Manga.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ShareGuard } from '@/base/components/guard/ShareGuard.tsx';
import { ClipBoardGuard } from '@/base/components/guard/ClipBoardGuard.tsx';
import { copyToClipboard } from '@/lib/HelperFunctions.ts';
import { ChaptersMarkAllReadMenuItem } from '@/features/chapter/components/ChaptersMarkAllReadMenuItem.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { useGetMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';
import { MangaNotesDialog } from '@/features/manga/components/details/MangaNotes.tsx';

interface IProps {
    manga: MangaIdInfo & MangaInLibraryInfo & MangaSourceIdInfo & MangaTitleInfo & MangaUrlInfo & MangaMetaInfo;
    onRefresh: () => any;
    refreshing: boolean;
}

/**
 * Mihon's manga toolbar actions: icons on wide screens, an overflow menu next to the chapter actions on phones.
 */
export const MangaToolbarMenu = ({ manga, onRefresh, refreshing }: IProps) => {
    const { t } = useLingui();

    const isLargeScreen = !MediaQuery.useIsBelowWidth('md');
    const { settings } = useMetadataServerSettings();
    const { notes } = useGetMangaMetadata(manga);
    const notesTitle = notes.trim().length ? t`Edit notes` : t`Add notes`;
    const notesDialogState = usePopupState({ variant: 'dialog', popupId: 'manga-toolbar-notes-dialog' });

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClose = () => {
        setAnchorEl(null);
    };

    const openCategorySelection = () => {
        AwaitableComponent.show(CategorySelect, { mangaId: manga.id });
    };

    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const saveDynamicColorTheme = () => {
        AwaitableComponent.show(ThemeCreationDialog, {
            mode: 'save_dynamic',
        });
    };

    const share = () =>
        navigator
            .share({
                title: manga.title,
                url: manga.realUrl ?? undefined,
            })
            .catch(defaultPromiseErrorHandler('MangaToolbarMenu::share'));

    // the title's long press copies it too, but nothing hints at that on touch screens
    const copyTitle = () => copyToClipboard(manga.title);

    const migratePath = AppRoutes.migrate.children.singleMangaSearch.path(manga.sourceId, manga.id, manga.title);
    const migrateState = AppRoutes.migrate.children.singleMangaSearch.state({
        title: t`Migrate "${manga.title}"`,
        mode: 'migrate.select.single',
    });

    const notesDialog = (
        <MangaNotesDialog manga={manga} open={notesDialogState.isOpen} onClose={notesDialogState.close} />
    );

    if (isLargeScreen) {
        return (
            <>
                <CustomTooltip title={t`Reload data from source`} disabled={refreshing}>
                    <IconButton onClick={() => onRefresh()} disabled={refreshing} color="inherit">
                        <RefreshRoundedIcon />
                    </IconButton>
                </CustomTooltip>
                {settings.mangaDynamicColorSchemes && (
                    <CustomTooltip title={t`Save dynamic color theme`}>
                        <IconButton onClick={saveDynamicColorTheme} color="inherit">
                            <ColorLensRoundedIcon />
                        </IconButton>
                    </CustomTooltip>
                )}
                <ShareGuard>
                    <CustomTooltip title={t`Share`} disabled={!manga.realUrl}>
                        <IconButton color="inherit" disabled={!manga.realUrl} onClick={share}>
                            <ShareRoundedIcon />
                        </IconButton>
                    </CustomTooltip>
                </ShareGuard>
                <ClipBoardGuard>
                    <CustomTooltip title={t`Copy`}>
                        <IconButton color="inherit" onClick={copyTitle}>
                            <ContentCopyRoundedIcon />
                        </IconButton>
                    </CustomTooltip>
                </ClipBoardGuard>
                <CustomTooltip title={notesTitle}>
                    <IconButton onClick={notesDialogState.open} color="inherit">
                        <EditNoteRoundedIcon />
                    </IconButton>
                </CustomTooltip>
                {manga.inLibrary && (
                    <>
                        <CustomTooltip title={t`Migrate`}>
                            <IconButton component={Link} to={migratePath} state={migrateState} color="inherit">
                                <SyncAltRoundedIcon />
                            </IconButton>
                        </CustomTooltip>
                        <CustomTooltip title={t`Edit manga categories`}>
                            <IconButton onClick={openCategorySelection} color="inherit">
                                <LabelRoundedIcon />
                            </IconButton>
                        </CustomTooltip>
                    </>
                )}
                {notesDialog}
            </>
        );
    }

    return (
        <>
            <CustomTooltip title={t`More`}>
                <IconButton
                    id="chaptersMenuButton"
                    aria-label={t`More`}
                    aria-controls={open ? 'chaptersMenu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    color="inherit"
                >
                    <MoreVertRoundedIcon />
                </IconButton>
            </CustomTooltip>
            <Menu
                id="chaptersMenu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    list: {
                        'aria-labelledby': 'chaptersMenuButton',
                    },
                }}
            >
                {/* the chapter list's toolbar action of the two column layout */}
                <ChaptersMarkAllReadMenuItem manga={manga} onClose={handleClose} />
                <MenuItem
                    onClick={() => {
                        onRefresh();
                        handleClose();
                    }}
                    disabled={refreshing}
                >
                    <ListItemIcon>
                        <RefreshRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t`Reload data from source`}</ListItemText>
                </MenuItem>
                {settings.mangaDynamicColorSchemes && (
                    <MenuItem onClick={saveDynamicColorTheme}>
                        <ListItemIcon>
                            <ColorLensRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t`Save dynamic color theme`}</ListItemText>
                    </MenuItem>
                )}
                {manga.inLibrary && [
                    <MenuItem
                        key="categories"
                        onClick={() => {
                            openCategorySelection();
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <LabelRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t`Edit manga categories`}</ListItemText>
                    </MenuItem>,
                    <MenuItem key="migrate" component={Link} to={migratePath} state={migrateState}>
                        <ListItemIcon>
                            <SyncAltRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t`Migrate`}</ListItemText>
                    </MenuItem>,
                ]}
                <ShareGuard>
                    <MenuItem disabled={!manga.realUrl} onClick={share}>
                        <ListItemIcon>
                            <ShareRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t`Share`}</ListItemText>
                    </MenuItem>
                </ShareGuard>
                <ClipBoardGuard>
                    <MenuItem
                        onClick={() => {
                            copyTitle();
                            handleClose();
                        }}
                    >
                        <ListItemIcon>
                            <ContentCopyRoundedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t`Copy`}</ListItemText>
                    </MenuItem>
                </ClipBoardGuard>
                <MenuItem
                    onClick={() => {
                        notesDialogState.open();
                        handleClose();
                    }}
                >
                    <ListItemIcon>
                        <EditNoteRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{notesTitle}</ListItemText>
                </MenuItem>
            </Menu>
            {notesDialog}
        </>
    );
};
