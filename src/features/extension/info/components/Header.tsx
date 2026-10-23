/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { TExtension } from '@/features/extension/Extensions.types.ts';
import { SourceIcon } from '@/features/source/components/SourceIcon.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

const ICON_SIZE = 112;

/**
 * Mihon's "DetailsHeader": the large icon, the name, the package and the store.
 */
export const Header = ({ name, pkgName, iconUrl, extensionStore }: TExtension) => (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', px: 2, pt: 2, pb: 1 }}>
        <SourceIcon iconUrl={iconUrl} alt={name} size={ICON_SIZE} borderRadius={M3_SHAPE.large} />
        <Typography variant="headlineSmall" component="h2">
            {name}
        </Typography>
        <Typography variant="bodySmall" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
            {pkgName.replace('eu.kanade.tachiyomi.extension.', '')}
        </Typography>
        {extensionStore && (
            <Typography variant="labelLarge" sx={{ color: 'm3.primary', py: 0.25 }}>
                {extensionStore.name}
            </Typography>
        )}
    </Stack>
);
