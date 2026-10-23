/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { ChapterHistoryListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { epochToDate, timeFormatter } from '@/base/utils/DateHelper.ts';
import type { ListRowHeight } from '@/base/components/lists/ListRow.tsx';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { MangaCoverLink } from '@/features/manga/components/MangaCoverLink.tsx';
import { getCoverImageWidth } from '@/base/components/images/CoverImage.tsx';
import { ChapterDownloadActions } from '@/features/chapter/components/ChapterDownloadActions.tsx';
import { ChapterRowGroup } from '@/features/chapter/components/ChapterRowGroup.tsx';

const ROW_HEIGHT: ListRowHeight = 96;
/**
 * The book cover fills the row's height inside its 8 px vertical padding.
 */
const COVER_HEIGHT = 80;

/**
 * Mihon's "HistoryItem": a 96 px row with a book cover, the manga title and the last read chapter with its time.
 */
export const ChapterHistoryCard = memo(
    ({
        chapter,
        otherChapters = STABLE_EMPTY_ARRAY,
    }: {
        chapter: ChapterHistoryListFieldsFragment;
        otherChapters?: ChapterHistoryListFieldsFragment[];
    }) => {
        const { t } = useLingui();
        const { manga } = chapter;

        const readAt = timeFormatter.format(epochToDate(Number(chapter.lastReadAt)).valueOf());
        // chapters without a parsed number (-1) keep their name
        const chapterLabel = chapter.chapterNumber >= 0 ? t`Ch. ${chapter.chapterNumber}` : chapter.name;

        return (
            <ChapterRowGroup
                otherChapters={otherChapters}
                leadingWidth={getCoverImageWidth('book', COVER_HEIGHT)}
                renderChapter={(otherChapter) => <ChapterHistoryCard chapter={otherChapter} />}
            >
                <ListRow
                    to={AppRoutes.reader.path(manga.id, chapter.sourceOrder)}
                    onClick={(e) => {
                        e.preventDefault();
                        ReaderService.openReader(chapter);
                    }}
                    minHeight={ROW_HEIGHT}
                    leading={<MangaCoverLink manga={manga} ratio="book" height={COVER_HEIGHT} />}
                    headline={manga.title}
                    // Mihon's history title is bodyMedium in semi bold, which is the "header" style
                    headlineVariant="header"
                    headlineMaxLines={2}
                    supporting={
                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                            {t`${chapterLabel} - ${readAt}`}
                        </Box>
                    }
                    supportingVariant="bodyMedium"
                    supportingMaxLines={1}
                    supportingEmphasis="high"
                    trailing={<ChapterDownloadActions chapter={chapter} />}
                />
            </ChapterRowGroup>
        );
    },
);
