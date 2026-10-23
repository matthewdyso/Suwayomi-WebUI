/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CollectionsBookmarkRoundedIcon from '@mui/icons-material/CollectionsBookmarkRounded';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { CoverImage, getCoverImageWidth } from '@/base/components/images/CoverImage.tsx';
import { TextBadge } from '@/base/components/badges/TextBadge.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * The cover of a migration entry or match, linking to the manga; dimmed with Mihon's in-library badge when the manga
 * is already in the library.
 */
export const MigrationEntryThumbnail = ({
    id,
    title,
    thumbnailUrl,
    inLibrary = false,
    height,
}: {
    id: MangaIdInfo['id'];
    title: string;
    thumbnailUrl: string;
    inLibrary?: boolean;
    height: number;
}) => {
    const { t } = useLingui();

    return (
        <Box
            component={Link}
            to={AppRoutes.manga.path(id)}
            onClick={(e) => e.stopPropagation()}
            sx={{ display: 'block', flexShrink: 0 }}
        >
            <CoverImage
                src={thumbnailUrl}
                alt={title}
                dimmed={inLibrary}
                small
                sx={{ width: getCoverImageWidth('book', height), height }}
            >
                {inLibrary && (
                    <CustomTooltip title={t`In Library`}>
                        <Box component="span" sx={{ position: 'absolute', top: 4, left: 4, display: 'flex' }}>
                            <TextBadge
                                icon={CollectionsBookmarkRoundedIcon}
                                sx={{ borderRadius: M3_SHAPE.extraSmall }}
                            />
                        </Box>
                    </CustomTooltip>
                )}
            </CoverImage>
        </Box>
    );
};
