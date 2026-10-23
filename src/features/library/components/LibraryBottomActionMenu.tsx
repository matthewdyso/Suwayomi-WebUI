/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import LabelRoundedIcon from '@mui/icons-material/LabelRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RemoveDoneRoundedIcon from '@mui/icons-material/RemoveDoneRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import { useMemo } from 'react';
import { AwaitableComponent } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { BottomActionMenu } from '@/base/collection/components/BottomActionMenu.tsx';
import { MenuItem } from '@/base/components/menu/MenuItem.tsx';
import { createGetMenuItemTitle } from '@/base/components/menu/Menu.utils.ts';
import { CategorySelect } from '@/features/category/components/CategorySelect.tsx';
import { ChaptersDownloadActionMenuItems } from '@/features/chapter/components/actions/ChaptersDownloadActionMenuItems.tsx';
import { MANGA_ACTION_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import type { MangaAction } from '@/features/manga/Manga.types.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { MangaChapterStatFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

const getMenuItemTitle = createGetMenuItemTitle(false, MANGA_ACTION_TO_TRANSLATION);

/**
 * Mihon's "LibraryBottomActionMenu": the actions for the selected library entries, the rarer ones in an overflow menu.
 */
export const LibraryBottomActionMenu = ({
    selectedMangas,
    onDone,
}: {
    selectedMangas: MangaChapterStatFieldsFragment[];
    /**
     * Ends the selection.
     */
    onDone: () => void;
}) => {
    const { t } = useLingui();

    const { downloadableMangas, downloadedMangas, unreadMangas, readMangas } = useMemo(
        () => ({
            downloadableMangas: [
                ...Mangas.getNotDownloaded(selectedMangas),
                ...Mangas.getPartiallyDownloaded(selectedMangas),
            ],
            downloadedMangas: [
                ...Mangas.getPartiallyDownloaded(selectedMangas),
                ...Mangas.getFullyDownloaded(selectedMangas),
            ],
            unreadMangas: [...Mangas.getUnread(selectedMangas), ...Mangas.getPartiallyRead(selectedMangas)],
            readMangas: [...Mangas.getPartiallyRead(selectedMangas), ...Mangas.getFullyRead(selectedMangas)],
        }),
        [selectedMangas],
    );

    const performAction = (action: MangaAction, mangas: MangaChapterStatFieldsFragment[]) => {
        Mangas.performAction(action, Mangas.getIds(mangas), { wasManuallyMarkedAsRead: true }).catch(
            defaultPromiseErrorHandler(`LibraryBottomActionMenu:performAction(${action})`),
        );
        onDone();
    };

    return (
        <BottomActionMenu
            aria-label={plural(selectedMangas.length, { one: '# manga', other: '# manga' })}
            actions={[
                {
                    title: t(MANGA_ACTION_TO_TRANSLATION.change_categories.action.single),
                    Icon: LabelRoundedIcon,
                    onClick: () => {
                        AwaitableComponent.show(CategorySelect, {
                            mangaIds: Mangas.getIds(selectedMangas),
                            addToLibrary: false,
                        });
                        onDone();
                    },
                },
                {
                    title: t(MANGA_ACTION_TO_TRANSLATION.mark_as_read.action.single),
                    Icon: DoneAllRoundedIcon,
                    disabled: !unreadMangas.length,
                    onClick: () => performAction('mark_as_read', unreadMangas),
                },
                {
                    title: t(MANGA_ACTION_TO_TRANSLATION.mark_as_unread.action.single),
                    Icon: RemoveDoneRoundedIcon,
                    disabled: !readMangas.length,
                    onClick: () => performAction('mark_as_unread', readMangas),
                },
                {
                    title: t(MANGA_ACTION_TO_TRANSLATION.download.action.single),
                    Icon: DownloadRoundedIcon,
                    disabled: !downloadableMangas.length,
                    menu: (onClose) => (
                        <ChaptersDownloadActionMenuItems
                            mangaIds={Mangas.getIds(selectedMangas)}
                            closeMenu={() => {
                                onClose();
                                onDone();
                            }}
                        />
                    ),
                },
                {
                    title: t`More`,
                    Icon: MoreVertRoundedIcon,
                    menu: () => [
                        <MenuItem
                            key="delete"
                            Icon={DeleteRoundedIcon}
                            disabled={!downloadedMangas.length}
                            onClick={() => performAction('delete', downloadedMangas)}
                            title={getMenuItemTitle('delete', downloadedMangas.length)}
                        />,
                        <MenuItem
                            key="migrate"
                            Icon={SyncAltRoundedIcon}
                            onClick={() => performAction('migrate', selectedMangas)}
                            title={getMenuItemTitle('migrate', selectedMangas.length)}
                        />,
                        <MenuItem
                            key="remove"
                            Icon={FavoriteBorderRoundedIcon}
                            onClick={() => performAction('remove_from_library', selectedMangas)}
                            title={getMenuItemTitle('remove_from_library', selectedMangas.length)}
                        />,
                    ],
                },
            ]}
        />
    );
};
