/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { MenuItem } from '@/base/components/menu/MenuItem.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { filterChapters, useChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/chapter/ChapterQuery.ts';
import type { GetChaptersMangaQuery, GetChaptersMangaQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import type { GqlMetaHolder } from '@/features/metadata/Metadata.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

/**
 * "Mark all as read" of the chapter list's toolbar, as an overflow menu entry for phones: marks the chapters the list
 * shows (its filters apply) as read.
 */
export const ChaptersMarkAllReadMenuItem = ({
    manga,
    onClose,
}: {
    manga: MangaIdInfo & GqlMetaHolder;
    onClose: () => void;
}) => {
    const { t } = useLingui();
    const options = useChapterListOptions(manga);
    // the chapter list's query, answered from the cache
    const { data } = requestManager.useGetMangaChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
        GET_CHAPTERS_MANGA,
        manga.id,
    );
    const unreadChapters = useMemo(
        () => Chapters.getNonRead(filterChapters(data?.chapters.nodes ?? STABLE_EMPTY_ARRAY, options)),
        [data, options],
    );

    return (
        <MenuItem
            Icon={DoneAllRoundedIcon}
            title={t`Mark all as read`}
            disabled={!unreadChapters.length}
            onClick={() => {
                Chapters.markAsRead(unreadChapters, true, manga.id).catch(
                    defaultPromiseErrorHandler('ChaptersMarkAllReadMenuItem::markAsRead'),
                );
                onClose();
            }}
        />
    );
};
