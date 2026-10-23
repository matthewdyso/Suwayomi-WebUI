/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MouseEvent, ReactNode, Ref, TouchEvent } from 'react';
import { useId } from 'react';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { usePress } from '@/base/hooks/usePress.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { DISABLED_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

export type ListRowHeight = 56 | 64 | 72 | 88 | 96;

type ListRowPressEvent = MouseEvent | TouchEvent;

export type ListRowProps = {
    ref?: Ref<HTMLDivElement>;
    /**
     * Icon, avatar, cover or checkbox in front of the text.
     */
    leading?: ReactNode;
    headline: ReactNode;
    supporting?: ReactNode;
    /**
     * Text, icon buttons or a download indicator after the text.
     */
    trailing?: ReactNode;
    minHeight?: ListRowHeight;
    headlineVariant?: TypographyProps['variant'];
    supportingVariant?: TypographyProps['variant'];
    headlineMaxLines?: number;
    supportingMaxLines?: number;
    /**
     * "medium": Mihon's secondary text (.78 alpha), "high": full strength (e.g. Mihon's update and history rows).
     *
     * The alpha is on the text color, so parts with their own color (e.g. pills) keep it at full strength.
     */
    supportingEmphasis?: 'medium' | 'high';
    selected?: boolean;
    /**
     * Mihon's read items: headline and supporting text at .38 alpha (instead of 1 and .78).
     *
     * Like "supportingEmphasis", the alpha is on the text color, so parts with their own color (e.g. a bookmark icon)
     * keep it at full strength.
     */
    dimmed?: boolean;
    disabled?: boolean;
    /**
     * Navigates on click (router link).
     */
    to?: LinkProps['to'];
    /**
     * Router state passed along with "to".
     */
    state?: LinkProps['state'];
    onClick?: (event: ListRowPressEvent) => void;
    onLongPress?: (event: ListRowPressEvent) => void;
    sx?: SxProps<Theme>;
};

const NOOP = () => {};

const getSupportingColor = (dimmed: boolean, emphasis: ListRowProps['supportingEmphasis']): string | undefined => {
    if (dimmed) {
        return 'text.disabled';
    }

    return emphasis === 'medium' ? 'text.secondary' : undefined;
};

/**
 * Flat, full-bleed list row (M3 list item), the base of Mihon's chapter, update, history, source and extension rows.
 *
 * The row's click target is a layer behind the content, so interactive leading and trailing elements (buttons,
 * checkboxes, links) don't nest inside it and keep handling their own clicks.
 */
export const ListRow = ({
    ref,
    leading,
    headline,
    supporting,
    trailing,
    minHeight = 56,
    headlineVariant = 'bodyLarge',
    supportingVariant = 'bodyMedium',
    headlineMaxLines = 1,
    supportingMaxLines = 2,
    supportingEmphasis = 'medium',
    selected = false,
    dimmed = false,
    disabled = false,
    to,
    state,
    onClick,
    onLongPress,
    sx,
}: ListRowProps) => {
    const headlineId = useId();
    const supportingId = useId();
    const longPressBind = usePress({ onLongPress: onLongPress ?? NOOP, onPress: onClick ?? NOOP });
    const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

    const isInteractive = !!to || !!onClick || !!onLongPress;
    const pressHandlers = onLongPress ? longPressBind() : { onClick };

    return (
        <Box
            ref={ref}
            sx={MUIUtil.mergeSx(
                // long press selects the row, iOS must not show its text selection or link callout
                MediaQuery.preventMobileContextMenuSx(),
                {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minHeight,
                    px: 2,
                    py: 1,
                    bgcolor: selected ? 'm3.selected' : undefined,
                    opacity: disabled ? DISABLED_ALPHA : undefined,
                    // only the row's real controls receive clicks, everything else falls through to the row
                    '& > .ListRow-content': {
                        position: 'relative',
                        pointerEvents: 'none',
                        '& :is(a, button, input, label, select, textarea, [role="button"], [tabindex])': {
                            pointerEvents: 'auto',
                        },
                    },
                },
                sx,
            )}
        >
            {isInteractive && (
                <ButtonBase
                    {...pressHandlers}
                    // a long press must not also open the browser's link menu (Android)
                    onContextMenu={onLongPress ? preventMobileContextMenu : undefined}
                    component={to ? Link : 'button'}
                    to={to}
                    state={state}
                    disabled={disabled}
                    // VoiceOver tells rows of the same title apart by their supporting text (e.g. the chapter)
                    aria-labelledby={supporting ? `${headlineId} ${supportingId}` : headlineId}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        ...m3StateLayerSx(),
                    }}
                />
            )}
            {leading && (
                <Box className="ListRow-content" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {leading}
                </Box>
            )}
            <Box className="ListRow-content" sx={{ flexGrow: 1, minWidth: 0, color: 'm3.onSurface' }}>
                <TypographyMaxLines
                    id={headlineId}
                    variant={headlineVariant}
                    component="div"
                    lines={headlineMaxLines}
                    sx={{ color: dimmed ? 'text.disabled' : undefined }}
                >
                    {headline}
                </TypographyMaxLines>
                {supporting && (
                    <TypographyMaxLines
                        id={supportingId}
                        variant={supportingVariant}
                        component="div"
                        lines={supportingMaxLines}
                        sx={{ color: getSupportingColor(dimmed, supportingEmphasis) }}
                    >
                        {supporting}
                    </TypographyMaxLines>
                )}
            </Box>
            {trailing && (
                <Box
                    className="ListRow-content"
                    sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 1, color: 'm3.onSurfaceVariant' }}
                >
                    {trailing}
                </Box>
            )}
        </Box>
    );
};
