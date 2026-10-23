/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ChaptersDownloadActionMenuItems } from '@/features/chapter/components/actions/ChaptersDownloadActionMenuItems.tsx';
import type { MangaScreenFieldsFragment } from '@/lib/graphql/generated/graphql.ts';

/**
 * Mihon's "DownloadDropdownMenu": downloads the next, unread or all chapters of a manga.
 *
 * The menu ignores the chapter list's filters, so the button is disabled once every chapter of the manga is downloaded.
 */
export const ChaptersDownloadMenuButton = ({
    manga,
}: {
    manga: Pick<MangaScreenFieldsFragment, 'id' | 'downloadCount' | 'chapters'>;
}) => {
    const { t } = useLingui();
    const disabled = manga.downloadCount >= manga.chapters.totalCount;

    return (
        <PopupState variant="popover" popupId="chapterlist-download-button">
            {(popupState) => (
                <>
                    <CustomTooltip title={t`Download`} disabled={disabled}>
                        <IconButton
                            {...bindTrigger(popupState)}
                            aria-label={t`Download`}
                            disabled={disabled}
                            color="inherit"
                        >
                            <DownloadRoundedIcon />
                        </IconButton>
                    </CustomTooltip>
                    {popupState.isOpen && (
                        <Menu {...bindMenu(popupState)}>
                            <ChaptersDownloadActionMenuItems mangaIds={[manga.id]} closeMenu={popupState.close} />
                        </Menu>
                    )}
                </>
            )}
        </PopupState>
    );
};
