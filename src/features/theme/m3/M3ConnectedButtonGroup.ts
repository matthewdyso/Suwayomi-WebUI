/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CSSObject, Theme } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_STATE_LAYER_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { applyStateLayer } from '@/features/theme/m3/M3Color.utils.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';

import { M3_BUTTON } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * In px; a string in sx, where a number would be a theme spacing.
 */
export const CONNECTED_BUTTON_GROUP_GAP = '2px';

/**
 * The "full" corner of the default 40 px buttons. A larger radius (e.g. M3_SHAPE.full) makes CSS scale down every
 * corner of the button, so the 8 px inner corners next to it would become square.
 */
export const CONNECTED_BUTTON_GROUP_FULL_RADIUS = M3_BUTTON.height.medium / 2;

const hover = (styles: CSSObject): CSSObject => ({ '@media (hover: hover)': { '&:hover': styles } });

/**
 * Rounds the outer corners of the first and the last item of a connected button group.
 */
export const connectedButtonGroupOuterCornersSx = (firstSelector: string, lastSelector: string): CSSObject => ({
    [firstSelector]: {
        borderTopLeftRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
        borderBottomLeftRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
    },
    [lastSelector]: {
        borderTopRightRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
        borderBottomRightRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
    },
});

/**
 * An unselected item of a connected button group: inner corners of 8 (4 while pressed), on a tonal container.
 */
export const connectedButtonGroupItemSx = (theme: Theme): CSSObject => {
    const { m3 } = theme.palette;

    return {
        border: 0,
        boxShadow: 'none',
        borderRadius: M3_SHAPE.small,
        backgroundColor: m3.surfaceContainerHighest,
        color: m3.onSurfaceVariant,
        transition: [
            m3Transition(['border-radius'], M3_SPRING.fastSpatial),
            m3Transition(['background-color', 'color'], M3_SPRING.fastEffects),
        ].join(', '),
        ...hover({
            boxShadow: 'none',
            backgroundColor: applyStateLayer(
                m3.surfaceContainerHighest,
                m3.onSurfaceVariant,
                M3_STATE_LAYER_ALPHA.hover,
            ),
        }),
        '&:active': { borderRadius: M3_SHAPE.extraSmall },
    };
};

/**
 * A selected item of a connected button group: fully round, in the secondary container color.
 */
export const connectedButtonGroupSelectedItemSx = (theme: Theme): CSSObject => {
    const { m3 } = theme.palette;

    return {
        borderRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
        backgroundColor: m3.secondaryContainer,
        color: m3.onSecondaryContainer,
        ...hover({
            backgroundColor: applyStateLayer(
                m3.secondaryContainer,
                m3.onSecondaryContainer,
                M3_STATE_LAYER_ALPHA.hover,
            ),
        }),
    };
};

/**
 * M3 Expressive connected button group for a row of MUI Buttons that are direct children of the styled element.
 *
 * Choice buttons use variant "contained" when selected and "outlined" otherwise (the variants keep their meaning
 * without this style). MUI's ToggleButtonGroup gets the same look from the theme.
 */
export const connectedButtonGroupSx = (theme: Theme): CSSObject => ({
    gap: CONNECTED_BUTTON_GROUP_GAP,
    [`& > .${buttonClasses.root}`]: {
        minWidth: 48,
        ...connectedButtonGroupItemSx(theme),
        ...connectedButtonGroupOuterCornersSx('&:first-of-type', '&:last-of-type'),
    },
    [`& > .${buttonClasses.contained}`]: connectedButtonGroupSelectedItemSx(theme),
});

/**
 * M3 segmented buttons (Mihon's theme mode row) for a row of MUI Buttons that are direct children of the styled element:
 * outlined segments that share their borders, the selected one ("contained") in the secondary container color with
 * its check icon. The buttons pass the check as their start icon; unselected segments hide it.
 *
 * Applied after "connectedButtonGroupSx" (e.g. through SelectButton's stack sx), it replaces the connected look.
 */
export const segmentedButtonGroupSx = (theme: Theme): CSSObject => {
    const { m3 } = theme.palette;

    return {
        gap: 0,
        [`& > .${buttonClasses.root}`]: {
            height: M3_BUTTON.height.medium,
            border: `1px solid ${m3.outline}`,
            borderRadius: 0,
            backgroundColor: 'transparent',
            color: m3.onSurface,
            '&:active': { borderRadius: 0 },
            '&:not(:first-of-type)': { marginInlineStart: '-1px' },
            ...hover({ backgroundColor: applyStateLayer(m3.surface, m3.onSurface, M3_STATE_LAYER_ALPHA.hover) }),
            ...connectedButtonGroupOuterCornersSx('&:first-of-type', '&:last-of-type'),
        },
        [`& > .${buttonClasses.contained}`]: {
            backgroundColor: m3.secondaryContainer,
            color: m3.onSecondaryContainer,
            ...hover({
                backgroundColor: applyStateLayer(
                    m3.secondaryContainer,
                    m3.onSecondaryContainer,
                    M3_STATE_LAYER_ALPHA.hover,
                ),
            }),
        },
        [`& > .${buttonClasses.outlined} .${buttonClasses.startIcon}`]: {
            display: 'none',
        },
    };
};
