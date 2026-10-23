/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MangaScreenFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { isFilterActive, useChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import { ChaptersDownloadMenuButton } from '@/features/chapter/components/buttons/ChaptersDownloadMenuButton.tsx';
import { ChapterOptionsButton } from '@/features/chapter/components/buttons/ChapterOptionsButton.tsx';

/**
 * Mihon's chapter actions in the manga app bar on phones: download and filter.
 */
export const ChaptersAppBarActions = ({
    manga,
    onOpenOptions,
}: {
    manga: Pick<MangaScreenFieldsFragment, 'id' | 'meta' | 'downloadCount' | 'chapters'>;
    onOpenOptions: () => void;
}) => {
    const options = useChapterListOptions(manga);

    return (
        <>
            <ChaptersDownloadMenuButton manga={manga} />
            <ChapterOptionsButton isFiltered={isFilterActive(options)} onClick={onOpenOptions} />
        </>
    );
};
