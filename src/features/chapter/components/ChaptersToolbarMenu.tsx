/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import type {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterReadInfo,
} from '@/features/chapter/Chapter.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ChaptersDownloadMenuButton } from '@/features/chapter/components/buttons/ChaptersDownloadMenuButton.tsx';
import { ChapterOptionsButton } from '@/features/chapter/components/buttons/ChapterOptionsButton.tsx';

interface IProps {
    manga: ComponentProps<typeof ChaptersDownloadMenuButton>['manga'];
    chapters: (ChapterIdInfo & ChapterReadInfo & ChapterDownloadInfo & ChapterBookmarkInfo)[];
    isFiltered: boolean;
    onOpenOptions: () => void;
}

/**
 * The chapter list's own actions in the two column layout; on phones they are in the app bar.
 */
export const ChaptersToolbarMenu = ({ manga, chapters, isFiltered, onOpenOptions }: IProps) => {
    const { t } = useLingui();

    const areAllChaptersRead = useMemo(() => chapters.every(Chapters.isRead), [chapters]);

    return (
        <>
            <CustomTooltip title={t`Mark all as read`} disabled={areAllChaptersRead}>
                <IconButton
                    disabled={areAllChaptersRead}
                    onClick={() => Chapters.markAsRead(Chapters.getNonRead(chapters), true, manga.id)}
                    color="inherit"
                >
                    <DoneAllRoundedIcon />
                </IconButton>
            </CustomTooltip>
            <ChaptersDownloadMenuButton manga={manga} />
            <ChapterOptionsButton isFiltered={isFiltered} onClick={onOpenOptions} />
        </>
    );
};
