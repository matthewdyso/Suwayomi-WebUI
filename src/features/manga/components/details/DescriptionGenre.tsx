/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MouseEvent } from 'react';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip, { chipClasses } from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useLingui } from '@lingui/react/macro';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import type {
    MangaDescriptionInfo,
    MangaGenreInfo,
    MangaIdInfo,
    MangaLocationState,
    MangaMetaInfo,
    MangaSourceIdInfo,
} from '@/features/manga/Manga.types.ts';
import { SearchLink } from '@/features/manga/components/details/SearchLink.tsx';
import { MangaNotes } from '@/features/manga/components/details/MangaNotes.tsx';
import uniq from 'lodash/fp/uniq';
import { MarkdownViewer } from '@/lib/mui-tiptap/MarkdownViewer.tsx';
import { ChipRow } from '@/base/components/chips/ChipRow.tsx';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_TYPE_SCALE } from '@/features/theme/m3/M3Typography.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';
import { M3_STATE_LAYER_SX, m3StateLayerInteractionsSx } from '@/features/theme/m3/M3StateLayer.ts';

/**
 * Mihon always reserves three lines for the description, so the page doesn't jump once it's laid out.
 */
const DESCRIPTION_COLLAPSED_HEIGHT = 3 * M3_TYPE_SCALE.bodyMedium.lineHeight;
const EXPAND_SCRIM_HEIGHT = 24;
const EXPAND_ARROW_CLASS = 'DescriptionGenre-expandArrow';

export const DescriptionGenre = ({
    manga,
    mode,
}: {
    manga: MangaDescriptionInfo & MangaGenreInfo & MangaIdInfo & MangaMetaInfo & MangaSourceIdInfo;
    mode: MangaLocationState['mode'];
}) => {
    const { t } = useLingui();
    const { description, genre: mangaGenres, sourceId } = manga;

    const [isCollapsed, setIsCollapsed] = useLocalStorage('isDescriptionGenreCollapsed', true);

    const genres = useMemo(() => uniq(mangaGenres.filter(Boolean)), [mangaGenres]);

    // the description also toggles the genres between one scrolling row and all of them (Mihon)
    const toggleCollapsed = (event: MouseEvent) => {
        const isLinkClick = event.target instanceof Element && !!event.target.closest('a');
        // selecting text with the mouse ends in a click as well
        const isTextSelection = !!window.getSelection()?.toString();
        if (isLinkClick || isTextSelection) {
            return;
        }

        setIsCollapsed(!isCollapsed);
    };

    return (
        <Stack sx={{ gap: 1, pt: 1 }}>
            <MangaNotes manga={manga} sx={{ mx: 2 }} />
            <Box onClick={toggleCollapsed} sx={{ position: 'relative', px: 2, cursor: 'pointer' }}>
                <Collapse in={!isCollapsed} collapsedSize={DESCRIPTION_COLLAPSED_HEIGHT}>
                    <Box
                        sx={(theme) => ({
                            pb: `${EXPAND_SCRIM_HEIGHT}px`,
                            color: 'm3.onSurfaceVariant',
                            opacity: SECONDARY_ALPHA,
                            // mui-tiptap styles the editor with body1 (and the viewer justifies it); the doubled "&"
                            // outranks both
                            '&& .ProseMirror': { ...theme.typography.bodyMedium, textAlign: 'start' },
                        })}
                    >
                        <MarkdownViewer markdown={description || t`No description`} />
                    </Box>
                </Collapse>
                <ButtonBase
                    disableRipple
                    aria-label={isCollapsed ? t`Show more` : t`Show less`}
                    aria-expanded={!isCollapsed}
                    sx={(theme) => ({
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: EXPAND_SCRIM_HEIGHT,
                        color: 'm3.onSurface',
                        background: `linear-gradient(transparent, ${theme.palette.m3.surface})`,
                        // the arrow shows hover and keyboard focus
                        ...m3StateLayerInteractionsSx(`.${EXPAND_ARROW_CLASS}`),
                    })}
                >
                    <Box
                        component="span"
                        className={EXPAND_ARROW_CLASS}
                        sx={(theme) => ({
                            position: 'relative',
                            display: 'flex',
                            borderRadius: '50%',
                            // keeps the arrow readable on top of the text (Mihon)
                            background: `radial-gradient(${theme.palette.m3.surface}, transparent)`,
                            '&::before': M3_STATE_LAYER_SX,
                        })}
                    >
                        <KeyboardArrowDownRoundedIcon
                            sx={{
                                transform: isCollapsed ? undefined : 'rotate(180deg)',
                                transition: m3Transition(['transform'], M3_SPRING.defaultSpatial),
                            }}
                        />
                    </Box>
                </ButtonBase>
            </Box>
            {!!genres.length && (
                <ChipRow variant="tags" wrap={!isCollapsed} sx={{ py: 0.5 }}>
                    {genres.map((genre) => (
                        <SearchLink
                            key={genre}
                            query={genre}
                            sourceId={sourceId}
                            mode={mode}
                            // Mihon's tag chips keep a 40 px touch target
                            sx={{ display: 'inline-flex', py: 0.5 }}
                        >
                            <Chip
                                label={genre}
                                variant="outlined"
                                clickable
                                sx={(theme) => ({
                                    ...theme.typography.bodySmall,
                                    borderRadius: M3_SHAPE.small,
                                    [`& .${chipClasses.label}`]: { px: 1 },
                                })}
                            />
                        </SearchLink>
                    ))}
                </ChipRow>
            )}
        </Stack>
    );
};
