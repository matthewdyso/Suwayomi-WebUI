/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { StyledFab } from '@/base/components/buttons/StyledFab.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type {
    ChapterMangaInfo,
    ChapterNameInfo,
    ChapterNumberInfo,
    ChapterReadInfo,
    ChapterScanlatorInfo,
    ChapterSourceOrderInfo,
} from '@/features/chapter/Chapter.types.ts';
import { ContinueReadingTooltip } from '@/features/manga/components/ContinueReadingTooltip.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { useFabExpanded } from '@/base/hooks/useFabExpanded.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';

/**
 * Wide enough for the label in every language; the label animates its max width when the FAB collapses.
 */
const LABEL_MAX_WIDTH = 240;

/**
 * Mihon's small extended FAB that collapses to its icon while scrolling down.
 */
export function ResumeFab({
    chapter,
    scrollElement,
}: {
    chapter: ChapterMangaInfo &
        ChapterSourceOrderInfo &
        ChapterReadInfo &
        ChapterNumberInfo &
        ChapterNameInfo &
        ChapterScanlatorInfo;
    /**
     * The chapter list's own scroll container when it doesn't scroll with the window (two-pane layout).
     */
    scrollElement?: HTMLElement | Window | null;
}) {
    const { t } = useLingui();

    const { sourceOrder, name, chapterNumber, scanlator } = chapter;
    const isFirstChapter = sourceOrder === 1;
    const label = isFirstChapter ? t`Start` : t`Resume`;
    const isExpanded = useFabExpanded(scrollElement);

    return (
        <ContinueReadingTooltip
            chapterNumber={chapterNumber}
            name={name}
            sourceOrder={sourceOrder}
            scanlator={scanlator}
        >
            <StyledFab
                component={Link}
                variant="extended"
                aria-label={label}
                sx={{ minWidth: 56, gap: 0 }}
                to={AppRoutes.reader.path(chapter.mangaId, chapter.sourceOrder)}
                state={Chapters.getReaderOpenChapterLocationState(chapter)}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    ReaderService.openReader(chapter);
                }}
            >
                <PlayArrowRoundedIcon />
                <Box
                    component="span"
                    aria-hidden
                    sx={{
                        maxWidth: isExpanded ? LABEL_MAX_WIDTH : 0,
                        ml: isExpanded ? 1 : 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        opacity: isExpanded ? 1 : 0,
                        transition: [
                            m3Transition(['max-width', 'margin'], M3_SPRING.fastSpatial),
                            m3Transition(['opacity'], M3_SPRING.fastEffects),
                        ].join(', '),
                    }}
                >
                    {label}
                </Box>
            </StyledFab>
        </ContinueReadingTooltip>
    );
}
