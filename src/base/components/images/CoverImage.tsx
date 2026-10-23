/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { SpinnerImageProps } from '@/base/components/SpinnerImage.tsx';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { MANGA_COVER_ASPECT_RATIO } from '@/features/manga/Manga.constants.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

export type CoverImageRatio = 'book' | 'square';

const RATIO_TO_ASPECT_RATIO: Record<CoverImageRatio, string> = {
    book: MANGA_COVER_ASPECT_RATIO,
    square: '1 / 1',
};

/**
 * The width of a cover of the given height, as a CSS length.
 *
 * Covers in rows set it explicitly because WebKit sizes the cover's parent from the image's natural width instead of
 * the aspect ratio, which shifts the row's text by a few pixels per cover.
 */
export const getCoverImageWidth = (ratio: CoverImageRatio, height: number): string =>
    `calc(${height}px * (${RATIO_TO_ASPECT_RATIO[ratio]}))`;

/**
 * Mihon browse marks covers of manga that are already in the library with this alpha.
 */
const DIMMED_COVER_ALPHA = 0.34;

export type CoverImageProps = Pick<
    SpinnerImageProps,
    | 'src'
    | 'alt'
    | 'shouldLoad'
    | 'priority'
    | 'onLoad'
    | 'onError'
    | 'retryKeyPrefix'
    | 'useFetchApi'
    | 'disableCors'
    | 'shouldDecode'
    | 'ignoreQueue'
> & {
    ref?: Ref<HTMLDivElement>;
    ratio?: CoverImageRatio;
    dimmed?: boolean;
    /**
     * Small covers (list rows) show an icon instead of the "Retry" text when the image failed to load.
     */
    small?: boolean;
    /**
     * Rendered on top of the image, e.g. badges, a gradient or the title.
     */
    children?: ReactNode;
    sx?: SxProps<Theme>;
};

/**
 * Mihon's "MangaCover": a cropped cover with rounded corners and a placeholder color while it loads.
 */
export const CoverImage = ({
    ref,
    ratio = 'book',
    dimmed = false,
    small = false,
    children,
    sx,
    ...imageProps
}: CoverImageProps) => (
    <Box
        ref={ref}
        sx={MUIUtil.mergeSx(
            {
                position: 'relative',
                flexShrink: 0,
                aspectRatio: RATIO_TO_ASPECT_RATIO[ratio],
                overflow: 'hidden',
                borderRadius: M3_SHAPE.extraSmall,
                bgcolor: 'm3.coverPlaceholder',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
            },
            sx,
        )}
    >
        <SpinnerImage
            {...imageProps}
            imgStyle={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: dimmed ? DIMMED_COVER_ALPHA : undefined,
            }}
            spinnerStyle={{
                small,
                position: 'absolute',
                inset: 0,
                background: 'transparent',
            }}
        />
        {children}
    </Box>
);
