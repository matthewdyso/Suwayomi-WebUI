/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { memo } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { ChapterUpdateListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { MangaCoverLink } from '@/features/manga/components/MangaCoverLink.tsx';
import { getCoverImageWidth } from '@/base/components/images/CoverImage.tsx';
import { ChapterDownloadActions } from '@/features/chapter/components/ChapterDownloadActions.tsx';
import { ChapterRowGroup } from '@/features/chapter/components/ChapterRowGroup.tsx';
import { ChapterStatusIcons } from '@/features/chapter/components/ChapterStatusIcons.tsx';

const COVER_SIZE = 44;

// the chapter name shares a flex line with its icons, so it cuts itself off
const SINGLE_LINE_SX = {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
} satisfies SxProps<Theme>;

/**
 * Mihon's "UpdatesUiItem": a 56 px row with a square cover, the manga title and the chapter with its read progress.
 */
export const ChapterUpdateCard = memo(
    ({
        chapter,
        otherChapters = STABLE_EMPTY_ARRAY,
    }: {
        chapter: ChapterUpdateListFieldsFragment;
        otherChapters?: ChapterUpdateListFieldsFragment[];
    }) => {
        const { t } = useLingui();
        const { manga } = chapter;

        const hasReadProgress = !chapter.isRead && chapter.lastPageRead > 0;

        return (
            <ChapterRowGroup
                otherChapters={otherChapters}
                leadingWidth={getCoverImageWidth('square', COVER_SIZE)}
                renderChapter={(otherChapter) => <ChapterUpdateCard chapter={otherChapter} />}
            >
                <ListRow
                    to={AppRoutes.reader.path(manga.id, chapter.sourceOrder)}
                    onClick={(e) => {
                        e.preventDefault();
                        ReaderService.openReader(chapter);
                    }}
                    // Mihon pads only horizontally: the 44 px cover and the 48 px download button fit the 56 px row
                    sx={{ py: 0 }}
                    leading={<MangaCoverLink manga={manga} ratio="square" height={COVER_SIZE} />}
                    dimmed={chapter.isRead}
                    headline={manga.title}
                    headlineVariant="bodyMedium"
                    supporting={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <ChapterStatusIcons chapter={chapter} bookmarkSize={14} />
                            <Box component="span" sx={SINGLE_LINE_SX}>
                                {chapter.name}
                            </Box>
                            {hasReadProgress && (
                                <Box component="span" sx={{ flexShrink: 0, whiteSpace: 'pre', color: 'text.disabled' }}>
                                    {` • ${t`Page ${chapter.lastPageRead + 1}`}`}
                                </Box>
                            )}
                            {/* not in Mihon, but tells apart the groups of a series that more than one group scans;
                                it gives way to the chapter name when the line is too short for both */}
                            {chapter.scanlator && (
                                <Box component="span" sx={[SINGLE_LINE_SX, { whiteSpace: 'pre', flexShrink: 1000 }]}>
                                    {` • ${chapter.scanlator}`}
                                </Box>
                            )}
                        </Box>
                    }
                    supportingVariant="bodySmall"
                    supportingMaxLines={1}
                    supportingEmphasis="high"
                    trailing={<ChapterDownloadActions chapter={chapter} showDownloaded />}
                />
            </ChapterRowGroup>
        );
    },
);
