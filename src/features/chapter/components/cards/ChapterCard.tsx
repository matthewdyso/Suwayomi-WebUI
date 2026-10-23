/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import type { MouseEvent, ReactNode, TouchEvent } from 'react';
import { Fragment, memo, useRef } from 'react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { getDateString } from '@/base/utils/DateHelper.ts';
import { ChapterActionMenuItems } from '@/features/chapter/components/actions/ChapterActionMenuItems.tsx';
import { ChapterDownloadActions } from '@/features/chapter/components/ChapterDownloadActions.tsx';
import { ChapterStatusIcons } from '@/features/chapter/components/ChapterStatusIcons.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { Menu } from '@/base/components/menu/Menu.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import type {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterMangaInfo,
    ChapterNameInfo,
    ChapterNumberInfo,
    ChapterReadInfo,
    ChapterScanlatorInfo,
    ChapterSourceOrderInfo,
} from '@/features/chapter/Chapter.types.ts';
import type { ChapterType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';

type TChapter = ChapterIdInfo &
    ChapterMangaInfo &
    ChapterDownloadInfo &
    ChapterReadInfo &
    ChapterBookmarkInfo &
    ChapterNumberInfo &
    ChapterScanlatorInfo &
    ChapterNameInfo &
    ChapterSourceOrderInfo &
    Pick<ChapterType, 'uploadDate' | 'lastPageRead'>;

interface IProps {
    mode?: 'manga.page' | 'reader';
    chapter: TChapter;
    showChapterNumber: boolean;
    onSelect: (id: number, selected: boolean, isShiftKey?: boolean) => void;
    selected: boolean | null;
    selectable?: boolean;
    isActiveChapter?: boolean; // reader
}

/**
 * Mihon's chapter subtitle: date, read progress and scanlator, separated by dots.
 *
 * Plain inline text, so the row's single line clamp cuts off its end; flex parts inside the clamp are painted cut off
 * in WebKit even when they fit.
 */
const ChapterSupportingText = ({ parts }: { parts: { key: string; text: string; isReadProgress?: boolean }[] }) => (
    // Mihon's 6 dp between title and subtitle
    <Box component="span" sx={{ display: 'block', pt: '6px' }}>
        {parts.map(({ key, text, isReadProgress }, index) => (
            <Fragment key={key}>
                {index > 0 && ' • '}
                {isReadProgress ? (
                    // Mihon shows the read progress at the disabled alpha
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                        {text}
                    </Box>
                ) : (
                    text
                )}
            </Fragment>
        ))}
    </Box>
);

/**
 * Mihon's "MangaChapterListItem": a flat row with the unread dot, bookmark and title, the date, read progress and
 * scanlator below, and the download indicator. Long press selects, the menu has the actions for this chapter.
 */
export const ChapterCard = memo((props: IProps) => {
    const { t } = useLingui();

    const rowRef = useRef<HTMLDivElement>(null);
    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const {
        mode = 'manga.page',
        chapter,
        showChapterNumber,
        onSelect,
        selected,
        selectable = true,
        isActiveChapter = false,
    } = props;
    const isSelecting = selected !== null;

    const handleClick = (event: MouseEvent | TouchEvent) => {
        event.preventDefault();

        if (!isSelecting) {
            ReaderService.openReader(chapter, true);
            return;
        }

        onSelect(chapter.id, !selected, event.shiftKey);
    };

    const title = showChapterNumber ? `${t`Chapter`} ${chapter.chapterNumber}` : chapter.name;
    const uploadDate = Number(chapter.uploadDate ?? 0);
    const supportingParts = [
        uploadDate > 0 && { key: 'date', text: getDateString(uploadDate) },
        !chapter.isRead &&
            !!chapter.lastPageRead && {
                key: 'progress',
                text: t`Page ${chapter.lastPageRead + 1}`,
                isReadProgress: true,
            },
        !!chapter.scanlator && { key: 'scanlator', text: chapter.scanlator },
    ].filter((part) => !!part);

    const headline: ReactNode = (
        <>
            <ChapterStatusIcons chapter={chapter} bookmarkSize={18} />
            {title}
        </>
    );

    return (
        <PopupState variant="popover" popupId="chapter-card-action-menu">
            {(popupState) => (
                <>
                    <ListRow
                        ref={rowRef}
                        to={AppRoutes.reader.path(chapter.mangaId, chapter.sourceOrder)}
                        onClick={handleClick}
                        onLongPress={(event) => {
                            if (!selectable) {
                                if (rowRef.current) {
                                    popupState.open(rowRef.current);
                                }
                                return;
                            }

                            // like Mihon, a long press while selecting selects the range up to this chapter
                            onSelect(chapter.id, !selected, isSelecting || event.shiftKey);
                        }}
                        selected={!!selected || (mode === 'reader' && isActiveChapter)}
                        dimmed={chapter.isRead}
                        headline={headline}
                        headlineVariant="bodyMedium"
                        supporting={!!supportingParts.length && <ChapterSupportingText parts={supportingParts} />}
                        supportingVariant="bodySmall"
                        supportingMaxLines={1}
                        trailing={
                            // the 48 px hit boxes reach into the row padding, so the row keeps Mihon's height
                            <Box sx={{ display: 'flex', alignItems: 'center', my: -0.5 }}>
                                <ChapterDownloadActions chapter={chapter} showDownloaded />
                                {/* touch screens select with a long press and act through the bottom action menu (Mihon) */}
                                {isSelecting && !isTouchDevice && (
                                    <CustomTooltip title={selected ? t`Deselect` : t`Select`}>
                                        <Checkbox
                                            checked={selected}
                                            onClick={(event) => onSelect(chapter.id, !selected, event.shiftKey)}
                                        />
                                    </CustomTooltip>
                                )}
                                {!isSelecting && !isTouchDevice && (
                                    <CustomTooltip title={t`Options`}>
                                        <IconButton {...bindTrigger(popupState)} aria-label={t`Options`}>
                                            <MoreVertRoundedIcon />
                                        </IconButton>
                                    </CustomTooltip>
                                )}
                            </Box>
                        }
                        sx={{ py: 1.5, pl: 2, pr: 1, gap: 0.5 }}
                    />
                    {!isSelecting && popupState.isOpen && (
                        <Menu {...bindMenu(popupState)}>
                            {(onClose) => (
                                <ChapterActionMenuItems
                                    onClose={onClose}
                                    chapter={chapter}
                                    handleSelection={() => onSelect(chapter.id, true)}
                                    canBeDownloaded={Chapters.isDownloadable(chapter)}
                                    selectable={selectable}
                                />
                            )}
                        </Menu>
                    )}
                </>
            )}
        </PopupState>
    );
});
