/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DragHandleRoundedIcon from '@mui/icons-material/DragHandleRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ChapterDownloadRetryButton } from '@/features/chapter/components/buttons/ChapterDownloadRetryButton.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { ChapterDownloadStatus } from '@/features/chapter/Chapter.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { DownloadStateIndicatorLinear } from '@/base/components/downloads/DownloadStateIndicatorLinear.tsx';
import { DownloadState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { getDownloadQueueItemSx } from '@/features/downloads/Downloads.utils.ts';

interface ActionProps {
    reorderDownloads: (download: ChapterDownloadStatus, mode: 'top' | 'bottom', series?: boolean) => void;
    cancelDownloads: (download: ChapterDownloadStatus, series?: boolean) => void;
}

const getPagesText = (item: ChapterDownloadStatus, errorText: string): string | null => {
    if (item.state === DownloadState.Error) {
        return errorText;
    }

    const isDownloading = item.state === DownloadState.Downloading || item.progress >= 0.1;
    if (!isDownloading) {
        return null;
    }

    return `${(item.chapter.pageCount * item.progress).toFixed()}/${item.chapter.pageCount}`;
};

/**
 * Mihon's download queue item: drag handle, title with page progress, chapter, progress bar and a menu.
 */
export const DownloadQueueChapterCard = memo(
    ({
        item,
        reorderDownloads,
        cancelDownloads,
        isDragOverlay = false,
    }: { item: ChapterDownloadStatus; isDragOverlay?: boolean } & ActionProps) => {
        const { t } = useLingui();
        const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

        const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

        const pagesText = getPagesText(item, t`Error`);
        const chapterText = item.chapter.scanlator
            ? `${item.chapter.name} • ${item.chapter.scanlator}`
            : item.chapter.name;

        const menuAction = (action: () => void) => () => {
            setMenuAnchorEl(null);
            action();
        };

        return (
            <Box sx={getDownloadQueueItemSx(isDragOverlay)}>
                <ListItemButton
                    component={Link}
                    to={AppRoutes.manga.path(item.manga.id)}
                    onContextMenu={preventMobileContextMenu}
                    sx={MUIUtil.mergeSx(MediaQuery.preventMobileContextMenuSx(), { py: 0, pl: 1, pr: 0.5 })}
                >
                    <DragHandleRoundedIcon sx={{ m: 1, color: 'm3.onSurfaceVariant' }} />
                    <Stack sx={{ flexGrow: 1, minWidth: 0, py: 1, gap: 0.5 }}>
                        <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'baseline' }}>
                            <Typography variant="bodyMedium" noWrap sx={{ flexGrow: 1 }}>
                                {item.manga.title}
                            </Typography>
                            {pagesText && (
                                <Typography variant="bodySmall" sx={{ color: 'm3.onSurfaceVariant' }}>
                                    {pagesText}
                                </Typography>
                            )}
                        </Stack>
                        <Typography variant="bodySmall" noWrap>
                            {chapterText}
                        </Typography>
                        <Box sx={{ pt: 0.5 }}>
                            <DownloadStateIndicatorLinear chapterId={item.chapter.id} />
                        </Box>
                    </Stack>
                    <ChapterDownloadRetryButton chapterId={item.chapter.id} />
                    <CustomTooltip title={t`Menu`}>
                        <IconButton
                            {...MUIUtil.preventRippleProp()}
                            aria-label={t`Menu`}
                            aria-haspopup="menu"
                            onClick={(e) => {
                                // the button sits inside the row's link
                                e.preventDefault();
                                e.stopPropagation();
                                setMenuAnchorEl(e.currentTarget);
                            }}
                        >
                            <MoreVertRoundedIcon />
                        </IconButton>
                    </CustomTooltip>
                </ListItemButton>
                <Menu anchorEl={menuAnchorEl} open={!!menuAnchorEl} onClose={() => setMenuAnchorEl(null)}>
                    <MenuItem onClick={menuAction(() => reorderDownloads(item, 'top'))}>{t`Move to top`}</MenuItem>
                    <MenuItem onClick={menuAction(() => reorderDownloads(item, 'top', true))}>
                        {t`Move series to top`}
                    </MenuItem>
                    <MenuItem
                        onClick={menuAction(() => reorderDownloads(item, 'bottom'))}
                    >{t`Move to bottom`}</MenuItem>
                    <MenuItem onClick={menuAction(() => reorderDownloads(item, 'bottom', true))}>
                        {t`Move series to bottom`}
                    </MenuItem>
                    <MenuItem onClick={menuAction(() => cancelDownloads(item))}>{t`Cancel`}</MenuItem>
                    <MenuItem onClick={menuAction(() => cancelDownloads(item, true))}>
                        {t`Cancel all for this series`}
                    </MenuItem>
                </Menu>
            </Box>
        );
    },
);
