/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IMangaGridProps } from '@/features/manga/components/MangaGrid.tsx';
import { getMangaGridWrapperSx, MangaGrid } from '@/features/manga/components/MangaGrid.tsx';

type TMangaBaseGrid = Omit<IMangaGridProps['mangas'][number], 'downloadCount' | 'unreadCount' | 'chapters'>;

export function BaseMangaGrid(props: Omit<IMangaGridProps, 'mangas'> & { mangas: TMangaBaseGrid[] }) {
    const { mangas, gridLayout } = props;

    return (
        <MangaGrid
            gridWrapperProps={{ sx: getMangaGridWrapperSx(gridLayout) }}
            {...props}
            mangas={mangas as IMangaGridProps['mangas']}
        />
    );
}
