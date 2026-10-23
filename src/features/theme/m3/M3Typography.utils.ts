/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { TypographyVariantsOptions } from '@mui/material/styles';
import type {
    M3TypeScaleEmphasizedName,
    M3TypeScaleName,
    M3TypeStyle,
    M3TypographyStyle,
    M3TypographyVariant,
} from '@/features/theme/m3/M3.types.ts';
import {
    M3_EMPHASIZED_FONT_WEIGHT,
    M3_FONT_FAMILY,
    M3_HEADER_FONT_WEIGHT,
    M3_HTML_FONT_SIZE,
    M3_TYPE_SCALE,
    MUI_VARIANT_TO_M3_TYPE_SCALE,
} from '@/features/theme/m3/M3Typography.constants.ts';

const toRem = (px: number): string => `${px / M3_HTML_FONT_SIZE}rem`;

const roundTo = (value: number, decimals: number): number => Number(value.toFixed(decimals));

const createTypeStyle = (
    { fontSize, lineHeight, fontWeight, letterSpacing }: M3TypeStyle,
    fontFamily: string,
): M3TypographyStyle => ({
    fontFamily,
    fontSize: toRem(fontSize),
    lineHeight: roundTo(lineHeight / fontSize, 4),
    fontWeight,
    letterSpacing: `${roundTo(letterSpacing / fontSize, 4)}em`,
});

const M3_TYPE_SCALE_ENTRIES = Object.entries(M3_TYPE_SCALE) as [M3TypeScaleName, M3TypeStyle][];

/**
 * The M3 type scale as MUI typography options: every M3 style as its own variant (plus an emphasized twin and Mihon's
 * "header"), and MUI's variants mapped onto the scale.
 */
export const createM3TypographyOptions = (fontFamily: string = M3_FONT_FAMILY): TypographyVariantsOptions => {
    const m3Variants = Object.fromEntries(
        M3_TYPE_SCALE_ENTRIES.flatMap(([name, style]) => [
            [name, createTypeStyle(style, fontFamily)],
            [
                `${name}Emphasized`,
                createTypeStyle(
                    { ...style, fontWeight: M3_EMPHASIZED_FONT_WEIGHT[style.fontWeight] ?? style.fontWeight },
                    fontFamily,
                ),
            ],
        ]),
    ) as Record<M3TypeScaleName | M3TypeScaleEmphasizedName, M3TypographyStyle>;

    const muiVariants = Object.fromEntries(
        Object.entries(MUI_VARIANT_TO_M3_TYPE_SCALE).map(([muiVariant, m3Variant]) => [
            muiVariant,
            m3Variants[m3Variant],
        ]),
    );

    return {
        fontFamily,
        fontSize: 14,
        htmlFontSize: M3_HTML_FONT_SIZE,
        ...muiVariants,
        button: { ...m3Variants.labelLarge, textTransform: 'none' },
        overline: { ...m3Variants.labelSmall, textTransform: 'none' },
        ...m3Variants,
        header: { ...m3Variants.bodyMedium, fontWeight: M3_HEADER_FONT_WEIGHT },
    };
};

/**
 * HTML elements of the M3 variants; labels stay inline, everything else is a block of text.
 */
export const M3_TYPOGRAPHY_VARIANT_MAPPING: Record<M3TypographyVariant, 'p' | 'span'> = Object.fromEntries(
    [...M3_TYPE_SCALE_ENTRIES.flatMap(([name]) => [name, `${name}Emphasized`]), 'header'].map((variant) => [
        variant,
        variant.startsWith('label') ? 'span' : 'p',
    ]),
) as Record<M3TypographyVariant, 'p' | 'span'>;
