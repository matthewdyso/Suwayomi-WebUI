/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { MangaCardMode } from '@/features/manga/Manga.types.ts';
import { M3_STATE_LAYER_SX, m3StateLayerInteractionsSx } from '@/features/theme/m3/M3StateLayer.ts';

/**
 * Mihon's "ContinueReadingButtonGridPadding": the button's distance to the cover's bottom end corner.
 */
const CONTINUE_READING_BUTTON_GRID_INSET = '6px';

export const CONTINUE_READING_BUTTON_GRID_SX: SxProps<Theme> = {
    marginInlineEnd: CONTINUE_READING_BUTTON_GRID_INSET,
    mb: CONTINUE_READING_BUTTON_GRID_INSET,
};

const MANGA_CARD_STATE_LAYER_CLASS = 'MangaCard-stateLayer';

/**
 * The card's state layer has to cover the cover image (like Mihon's ripple), so it's a child after the cover instead of
 * the card's "::before". The card's buttons and badges sit above it ({@link MANGA_CARD_CONTROLS_Z_INDEX}).
 */
const StateLayer = styled('span')({
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    '&::before': M3_STATE_LAYER_SX,
});

export const MangaCardStateLayer = () => <StateLayer className={MANGA_CARD_STATE_LAYER_CLASS} />;

/**
 * For the positioned parts of a card holding its buttons and badges: keeps them above the {@link MangaCardStateLayer},
 * so the card's layer doesn't tint a button on top of the button's own layer.
 *
 * Local to the card, which isolates its stacking context.
 */
export const MANGA_CARD_CONTROLS_Z_INDEX = 1;

const MANGA_CARD_STATE_LAYER = `.${MANGA_CARD_STATE_LAYER_CLASS}::before`;

/**
 * Interaction styles shared by the grid and list cards:
 * - the {@link MangaCardStateLayer} on hover, keyboard focus and press, but not while one of the card's own buttons is
 *   hovered or pressed (they show their own layer)
 * - desktop only: hovering reveals the options button and, in browse, the add/remove library button
 *
 * The cards disable MUI's ripple, the state layer is their press feedback.
 */
export const getMangaCardInteractionSx = (mode: MangaCardMode | undefined): SxProps<Theme> => ({
    isolation: 'isolate',
    ...m3StateLayerInteractionsSx(`.${MANGA_CARD_STATE_LAYER_CLASS}`),
    [`&:has(:is(a, button, input):hover) ${MANGA_CARD_STATE_LAYER}, &:has(:is(a, button, input):active) ${MANGA_CARD_STATE_LAYER}`]:
        { opacity: 0 },
    '@media (hover: hover) and (pointer: fine)': {
        '&:hover .manga-option-button': {
            visibility: 'visible',
            pointerEvents: 'all',
        },
        '&:hover .source-manga-library-state-button': {
            display: 'inline-flex',
        },
        ...(mode === 'source' && {
            '&:hover .source-manga-library-state-indicator': {
                display: 'none',
            },
        }),
    },
});
