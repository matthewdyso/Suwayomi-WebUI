/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { CoverImageRatio } from '@/base/components/images/CoverImage.tsx';
import { CoverImage, getCoverImageWidth } from '@/base/components/images/CoverImage.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import type { MangaIdInfo, MangaThumbnailInfo, MangaTitleInfo } from '@/features/manga/Manga.types.ts';

/**
 * The cover in front of an update or history row; like Mihon's, it opens the manga instead of the chapter.
 */
export const MangaCoverLink = ({
    manga,
    ratio,
    height,
}: {
    manga: MangaIdInfo & MangaThumbnailInfo & MangaTitleInfo;
    ratio: CoverImageRatio;
    height: number;
}) => (
    <Box
        component={Link}
        to={AppRoutes.manga.path(manga.id)}
        sx={{ display: 'flex', borderRadius: M3_SHAPE.extraSmall }}
    >
        <CoverImage
            ratio={ratio}
            src={Mangas.getThumbnailUrl(manga)}
            alt={manga.title}
            small
            sx={{ width: getCoverImageWidth(ratio, height), height }}
        />
    </Box>
);
