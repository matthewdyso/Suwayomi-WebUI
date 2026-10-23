/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import type { MangaLocationState } from '@/features/manga/Manga.types.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export const SearchLink = ({
    query,
    sourceId,
    mode,
    children,
    sx,
}: {
    query: string;
    sourceId: SourceIdInfo['id'] | undefined;
    mode: MangaLocationState['mode'] | 'source.global-search';
    children?: ReactNode;
    sx?: SxProps<Theme>;
}) => {
    const link = (() => {
        const isSourceMode = mode === 'source' && sourceId !== undefined;
        if (isSourceMode) {
            return AppRoutes.sources.children.browse.path(sourceId, query);
        }

        if (mode === 'source.global-search') {
            return AppRoutes.sources.children.searchAll.path(query);
        }

        return AppRoutes.library.path(undefined, query);
    })();

    return (
        <Link component={RouterLink} to={link} sx={MUIUtil.mergeSx({ textDecoration: 'none', color: 'inherit' }, sx)}>
            {children ?? query}
        </Link>
    );
};
