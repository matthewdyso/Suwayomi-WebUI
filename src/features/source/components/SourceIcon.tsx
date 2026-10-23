/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import type { SxProps, Theme } from '@mui/material/styles';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

/**
 * Size of the placeholder glyph relative to the icon.
 */
const PLACEHOLDER_SCALE = 0.6;

/**
 * Mihon's "SourceIcon" / "ExtensionIcon": the source's or extension's icon, or a placeholder while it loads, when it
 * has none or when it failed to load (instead of a spinner or a retry button, which don't fit into 40 px).
 */
export const SourceIcon = ({
    iconUrl,
    alt,
    size = 40,
    borderRadius = M3_SHAPE.small,
    sx,
}: {
    iconUrl: string;
    alt: string;
    size?: number;
    borderRadius?: string;
    sx?: SxProps<Theme>;
}) => {
    const [loadedIconUrl, setLoadedIconUrl] = useState<string>();
    const isLoaded = !!iconUrl && loadedIconUrl === iconUrl;

    return (
        <Box
            sx={MUIUtil.mergeSx(
                {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: size,
                    height: size,
                    overflow: 'hidden',
                    borderRadius,
                    bgcolor: isLoaded ? undefined : 'm3.surfaceContainerHighest',
                    color: 'm3.onSurfaceVariant',
                },
                sx,
            )}
        >
            {!isLoaded && <ExtensionRoundedIcon sx={{ fontSize: size * PLACEHOLDER_SCALE }} />}
            {!!iconUrl && (
                <SpinnerImage
                    src={requestManager.getValidImgUrlFor(iconUrl)}
                    alt={alt}
                    ignoreQueue
                    onLoad={() => setLoadedIconUrl(iconUrl)}
                    imgStyle={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    spinnerStyle={{ display: 'none' }}
                />
            )}
        </Box>
    );
};
