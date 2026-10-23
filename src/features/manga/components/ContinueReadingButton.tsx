/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import { Link } from 'react-router-dom';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import type {
    ChapterNameInfo,
    ChapterNumberInfo,
    ChapterReadInfo,
    ChapterScanlatorInfo,
    ChapterSourceOrderInfo,
} from '@/features/chapter/Chapter.types.ts';
import { ContinueReadingTooltip } from '@/features/manga/components/ContinueReadingTooltip.tsx';
import type { CoverIconButtonSize } from '@/features/manga/components/cards/CoverIconButton.styles.ts';
import { getCoverIconButtonSx } from '@/features/manga/components/cards/CoverIconButton.styles.ts';

export const ContinueReadingButton = ({
    showContinueReadingButton,
    chapter,
    mangaLinkTo,
    size = 'large',
    sx,
}: {
    showContinueReadingButton: boolean;
    chapter?:
        | (ChapterSourceOrderInfo & ChapterReadInfo & ChapterNumberInfo & ChapterNameInfo & ChapterScanlatorInfo)
        | null;
    mangaLinkTo: string;
    size?: CoverIconButtonSize;
    sx?: SxProps<Theme>;
}) => {
    if (!showContinueReadingButton || !chapter) {
        return null;
    }

    const { sourceOrder, chapterNumber, name, scanlator } = chapter;

    return (
        <ContinueReadingTooltip
            chapterNumber={chapterNumber}
            name={name}
            sourceOrder={sourceOrder}
            scanlator={scanlator}
        >
            <ButtonBase
                {...MUIUtil.preventRippleProp()}
                sx={MUIUtil.mergeSx(getCoverIconButtonSx(size), sx)}
                component={Link}
                to={`${mangaLinkTo}/chapter/${sourceOrder}`}
                state={Chapters.getReaderOpenChapterLocationState(chapter)}
                onClick={(e) => e.stopPropagation()}
            >
                <PlayArrowRounded />
            </ButtonBase>
        </ContinueReadingTooltip>
    );
};
