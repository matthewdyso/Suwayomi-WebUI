/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useLayoutEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { CoverImage } from '@/base/components/images/CoverImage.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import {
    PUBLISHING_STATUS_TO_TRANSLATION,
    PUBLISHING_TYPE_TO_TRANSLATION,
} from '@/features/tracker/Tracker.constants.ts';
import type { TTrackerManga } from '@/features/tracker/Tracker.types.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

const COVER_WIDTH = 56;
const INFO_MAX_LINES = 2;
/**
 * Mihon's "SearchResultItem" description.
 */
const SUMMARY_MAX_LINES = 4;

const SUMMARY_TEXT_SX = { color: 'text.secondary', whiteSpace: 'pre-line' } as const;

/**
 * The summary below the result, cut off after four lines (Mihon). A cut-off summary expands in place on tap, so the
 * right match can be picked by its synopsis.
 */
const TrackerMangaCardSummary = ({ summary }: { summary: string }) => {
    const { t } = useLingui();

    const collapsedSummaryRef = useRef<HTMLSpanElement>(null);
    const [isExpandable, setIsExpandable] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useLayoutEffect(() => {
        const summaryElement = collapsedSummaryRef.current;
        setIsExpandable(!!summaryElement && summaryElement.scrollHeight > summaryElement.clientHeight);
    }, [summary]);

    const summaryText = isExpanded ? (
        <Typography variant="bodySmall" component="span" sx={SUMMARY_TEXT_SX}>
            {summary}
        </Typography>
    ) : (
        <TypographyMaxLines
            ref={collapsedSummaryRef}
            variant="bodySmall"
            component="span"
            lines={SUMMARY_MAX_LINES}
            sx={SUMMARY_TEXT_SX}
        >
            {summary}
        </TypographyMaxLines>
    );

    if (!isExpandable) {
        return <Box sx={{ px: 2, pb: 1.5 }}>{summaryText}</Box>;
    }

    return (
        <ButtonBase
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.5,
                width: '100%',
                px: 2,
                pb: 1.5,
                textAlign: 'start',
                ...m3StateLayerSx(),
            }}
        >
            {summaryText}
            <Typography variant="labelLarge" component="span" sx={{ color: 'm3.primary' }}>
                {isExpanded ? t`Show less` : t`Show more`}
            </Typography>
        </ButtonBase>
    );
};

/**
 * A tracker search result: cover, title and publishing info, with the summary below. Selecting it shows the track
 * button of the search.
 */
export const TrackerMangaCard = ({
    manga,
    selected,
    onSelect,
}: {
    manga: TTrackerManga;
    selected: boolean;
    onSelect: () => void;
}) => {
    const { t } = useLingui();

    const info = [
        manga.publishingType && t(PUBLISHING_TYPE_TO_TRANSLATION[Trackers.getPublishingType(manga)]),
        manga.publishingStatus && t(PUBLISHING_STATUS_TO_TRANSLATION[Trackers.getPublishingStatus(manga)]),
        manga.startDate && t`Started: ${manga.startDate}`,
        manga.score > 0 && t`Score: ${manga.score}`,
        manga.totalChapters > 0 && t`Chapters: ${manga.totalChapters}`,
    ]
        .filter(Boolean)
        .join(' • ');
    const summary = manga.summary.trim();

    return (
        // the selection color also covers the summary below the row
        <Box sx={{ bgcolor: selected ? 'm3.selected' : undefined }}>
            <ListRow
                minHeight={96}
                onClick={onSelect}
                leading={
                    <CoverImage
                        src={manga.coverUrl}
                        alt={manga.title}
                        useFetchApi={false}
                        disableCors
                        ignoreQueue
                        small
                        sx={{ width: COVER_WIDTH }}
                    />
                }
                headline={manga.title}
                headlineVariant="titleMedium"
                headlineMaxLines={2}
                supporting={info}
                supportingMaxLines={INFO_MAX_LINES}
                trailing={
                    <>
                        {selected && <CheckCircleRoundedIcon aria-label={t`Selected`} sx={{ color: 'm3.primary' }} />}
                        <CustomTooltip title={t`Open in browser`}>
                            <IconButton
                                href={manga.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={t`Open in browser`}
                            >
                                <OpenInNewRoundedIcon />
                            </IconButton>
                        </CustomTooltip>
                    </>
                }
                sx={{ alignItems: 'flex-start', py: 1.5 }}
            />
            {!!summary && <TrackerMangaCardSummary summary={summary} />}
        </Box>
    );
};
