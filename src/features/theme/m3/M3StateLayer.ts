/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CSSObject } from '@mui/material/styles';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { M3_STATE_LAYER_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';

/**
 * The M3 state layer for a "::before" pseudo-element: an overlay in the content color that is invisible at rest.
 *
 * The element it belongs to needs a position; {@link m3StateLayerInteractionsSx} shows it.
 */
export const M3_STATE_LAYER_SX: CSSObject = {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundColor: 'currentColor',
    opacity: 0,
    pointerEvents: 'none',
    transition: m3Transition(['opacity'], M3_SPRING.fastEffects),
};

/**
 * Shows the state layer while the element is hovered, focused by keyboard or pressed.
 *
 * Without "layerSelector" the layer is the element's own "::before", otherwise the "::before" of the descendant
 * matching it (e.g. the pill of a navigation item).
 */
export const m3StateLayerInteractionsSx = (layerSelector?: string): CSSObject => {
    const layer = layerSelector ? ` ${layerSelector}::before` : '::before';

    return {
        '@media (hover: hover)': {
            [`&:hover${layer}`]: { opacity: M3_STATE_LAYER_ALPHA.hover },
        },
        [`&.${buttonBaseClasses.focusVisible}${layer}`]: { opacity: M3_STATE_LAYER_ALPHA.focus },
        [`&:active${layer}`]: { opacity: M3_STATE_LAYER_ALPHA.pressed },
    };
};

/** The element's own "::before" state layer, shown while it is hovered, focused by keyboard or pressed. */
export const m3StateLayerSx = (): CSSObject => ({
    '&::before': M3_STATE_LAYER_SX,
    ...m3StateLayerInteractionsSx(),
});
