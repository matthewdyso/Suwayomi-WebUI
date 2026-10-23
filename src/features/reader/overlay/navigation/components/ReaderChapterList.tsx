/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Virtuoso } from 'react-virtuoso';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReaderStateChapters } from '@/features/reader/Reader.types.ts';
import { ChapterListCard } from '@/features/chapter/components/cards/ChapterListCard.tsx';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

const onSelectNoop = () => {};

/**
 * Rough height of a chapter row, so the list sizes itself to its content until its container's max height is reached.
 */
const ESTIMATED_ROW_HEIGHT_PX = 100;

export const ReaderChapterList = ({
    currentChapterId,
    chapters,
    sx,
}: { currentChapterId: ChapterIdInfo['id'] | undefined; sx?: SxProps<Theme> } & Pick<
    ReaderStateChapters,
    'chapters'
>) => {
    const currentChapterIndex = useMemo(() => {
        if (currentChapterId === undefined) {
            return 0;
        }

        return chapters.findIndex((chapter) => chapter.id === currentChapterId);
    }, [currentChapterId, chapters]);

    return (
        <Box sx={MUIUtil.mergeSx({ height: chapters.length * ESTIMATED_ROW_HEIGHT_PX }, sx)}>
            <Virtuoso
                initialTopMostItemIndex={currentChapterIndex}
                totalCount={chapters.length}
                computeItemKey={(index) => chapters[index].id}
                itemContent={(index) => (
                    <ChapterListCard
                        index={index}
                        chapters={chapters}
                        isSortDesc
                        mode="reader"
                        showChapterNumber={false}
                        selected={null}
                        onSelect={onSelectNoop}
                        selectable={false}
                        isActiveChapter={index === currentChapterIndex}
                    />
                )}
                increaseViewportBy={400}
            />
        </Box>
    );
};
