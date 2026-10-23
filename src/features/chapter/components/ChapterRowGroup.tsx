/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import { plural } from '@lingui/core/macro';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { Virtuoso } from 'react-virtuoso';
import type { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';
import { M3_BUTTON, M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * ListRow's start padding and the gap after its leading element; both are the screen padding.
 */
const LIST_ROW_SPACING = M3_LAYOUT.screenPadding;

/**
 * A chapter row followed by the other chapters of the same manga and date, collapsed behind a "Show N more chapters"
 * text button that lines up with the row's text column.
 */
export const ChapterRowGroup = <Chapter extends ChapterIdInfo>({
    children,
    otherChapters,
    leadingWidth,
    renderChapter,
}: {
    children: ReactNode;
    otherChapters: Chapter[];
    /**
     * Width of the row's leading element (the cover), a CSS length.
     */
    leadingWidth: string;
    renderChapter: (chapter: Chapter) => ReactNode;
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!otherChapters.length) {
        return children;
    }

    const count = otherChapters.length;

    return (
        <>
            {children}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: M3_LAYOUT.minTouchTarget,
                    // the text button's own padding is subtracted, so its label lines up with the row text
                    pl: `calc(${LIST_ROW_SPACING * 2 - M3_BUTTON.paddingInline.text}px + ${leadingWidth})`,
                }}
            >
                <Button
                    variant="text"
                    aria-expanded={isExpanded}
                    endIcon={isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {plural(count, {
                        one: 'Show # more chapter',
                        other: 'Show # more chapters',
                    })}
                </Button>
            </Box>
            <Collapse in={isExpanded}>
                <Virtuoso
                    useWindowScroll
                    data={otherChapters}
                    computeItemKey={(_index, chapter) => chapter.id}
                    itemContent={(_index, chapter) => renderChapter(chapter)}
                />
            </Collapse>
        </>
    );
};
