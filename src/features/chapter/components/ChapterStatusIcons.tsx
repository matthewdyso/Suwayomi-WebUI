/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import type { ChapterBookmarkInfo, ChapterReadInfo } from '@/features/chapter/Chapter.types.ts';

/**
 * Mihon's unread dot and bookmark icon in front of a chapter's name (chapter, update and history rows).
 *
 * Inline elements, so they work in running text and in flex rows; the bookmark is as tall as the text's line minus 2 px.
 */
export const ChapterStatusIcons = ({
    chapter,
    bookmarkSize,
}: {
    chapter: ChapterReadInfo & ChapterBookmarkInfo;
    bookmarkSize: number;
}) => {
    const { t } = useLingui();

    return (
        <>
            {!chapter.isRead && (
                <Box
                    component="span"
                    role="img"
                    aria-label={t`Unread`}
                    sx={{
                        display: 'inline-block',
                        flexShrink: 0,
                        width: 8,
                        height: 8,
                        mr: 0.75,
                        borderRadius: '50%',
                        bgcolor: 'm3.primary',
                        verticalAlign: 'middle',
                    }}
                />
            )}
            {chapter.isBookmarked && (
                <BookmarkRoundedIcon
                    titleAccess={t`Bookmarked`}
                    sx={{
                        flexShrink: 0,
                        fontSize: bookmarkSize,
                        mr: '2px',
                        color: 'm3.primary',
                        verticalAlign: 'text-bottom',
                    }}
                />
            )}
        </>
    );
};
