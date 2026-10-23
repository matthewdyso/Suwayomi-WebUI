/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BookmarkAddRoundedIcon from '@mui/icons-material/BookmarkAddRounded';
import BookmarkRemoveRoundedIcon from '@mui/icons-material/BookmarkRemoveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import RemoveDoneRoundedIcon from '@mui/icons-material/RemoveDoneRounded';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import type { BottomActionMenuAction } from '@/base/collection/components/BottomActionMenu.tsx';
import { BottomActionMenu } from '@/base/collection/components/BottomActionMenu.tsx';
import { CHAPTER_ACTION_TO_TRANSLATION } from '@/features/chapter/Chapter.constants.ts';
import type { ChapterAction } from '@/features/chapter/Chapter.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ChapterOpenExternallyMenuItems } from '@/features/chapter/components/actions/ChapterOpenExternallyMenuItems.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import type { ChapterListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

/**
 * Mihon's "MangaBottomActionMenu": the actions that apply to the selected chapters.
 */
export const ChapterBottomActionMenu = ({
    selectedChapters,
    allChapters,
    onDone,
}: {
    selectedChapters: ChapterListFieldsFragment[];
    /**
     * The manga's chapters, newest first; "mark previous as read" marks the ones after the selected chapter.
     */
    allChapters: ChapterListFieldsFragment[];
    /**
     * Ends the selection.
     */
    onDone: () => void;
}) => {
    const { t } = useLingui();
    const {
        settings: { deleteChaptersWithBookmark },
    } = useMetadataServerSettings();

    const { downloading, downloadable, deletable, unbookmarked, bookmarked, unread, read, previousUnread } =
        useMemo(() => {
            const selectedIndex = selectedChapters.length === 1 ? allChapters.indexOf(selectedChapters[0]) : -1;

            return {
                downloading: Chapters.getDownloading(selectedChapters),
                downloadable: Chapters.getDownloadable(selectedChapters),
                deletable: Chapters.getDeletable(Chapters.getDownloaded(selectedChapters), deleteChaptersWithBookmark),
                unbookmarked: Chapters.getNonBookmarked(selectedChapters),
                bookmarked: Chapters.getBookmarked(selectedChapters),
                unread: Chapters.getNonRead(selectedChapters),
                read: Chapters.getRead(selectedChapters),
                previousUnread: selectedIndex === -1 ? [] : Chapters.getNonRead(allChapters.slice(selectedIndex + 1)),
            };
        }, [selectedChapters, allChapters, deleteChaptersWithBookmark]);

    const performAction = (action: ChapterAction, chapters: ChapterListFieldsFragment[]) => {
        Chapters.performAction(action, Chapters.getIds(chapters), {
            chapters,
            wasManuallyMarkedAsRead: true,
            trackProgressMangaId: chapters[0]?.mangaId,
        }).catch(defaultPromiseErrorHandler(`ChapterBottomActionMenu::performAction(${action})`));
        onDone();
    };

    const createAction = (
        action: ChapterAction,
        chapters: ChapterListFieldsFragment[],
        Icon: BottomActionMenuAction['Icon'],
    ): BottomActionMenuAction[] =>
        chapters.length
            ? [
                  {
                      title: t(CHAPTER_ACTION_TO_TRANSLATION[action].action.single),
                      Icon,
                      onClick: () => performAction(action, chapters),
                  },
              ]
            : [];

    // like Mihon, only the actions that change something are shown
    return (
        <BottomActionMenu
            aria-label={plural(selectedChapters.length, { one: '# chapter', other: '# chapters' })}
            actions={[
                ...createAction('bookmark', unbookmarked, BookmarkAddRoundedIcon),
                ...createAction('unbookmark', bookmarked, BookmarkRemoveRoundedIcon),
                ...createAction('mark_as_read', unread, DoneRoundedIcon),
                ...createAction('mark_as_unread', read, RemoveDoneRoundedIcon),
                ...(previousUnread.length
                    ? [
                          {
                              title: t`Mark previous as read`,
                              Icon: DoneAllRoundedIcon,
                              onClick: () => performAction('mark_as_read', previousUnread),
                          },
                      ]
                    : []),
                ...createAction('download', downloadable, DownloadRoundedIcon),
                ...createAction('download_cancel', downloading, CancelRoundedIcon),
                ...createAction('delete', deletable, DeleteRoundedIcon),
                // pointer devices open the chapter from the row menu; touch devices have no row menu
                ...(selectedChapters.length === 1
                    ? [
                          {
                              title: t`More`,
                              Icon: MoreVertRoundedIcon,
                              menu: (onClose: () => void) => (
                                  <ChapterOpenExternallyMenuItems
                                      chapter={selectedChapters[0]}
                                      onClose={() => {
                                          onClose();
                                          onDone();
                                      }}
                                  />
                              ),
                          },
                      ]
                    : []),
            ]}
        />
    );
};
