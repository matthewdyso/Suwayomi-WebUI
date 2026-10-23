/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import ButtonBase from '@mui/material/ButtonBase';
import Modal from '@mui/material/Modal';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { Vibrant } from 'node-vibrant/browser';
import { FastAverageColor } from 'fast-average-color';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { CoverImage } from '@/base/components/images/CoverImage.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import type { MangaThumbnailInfo } from '@/features/manga/Manga.types.ts';
import { useAppThemeContext } from '@/features/theme/AppThemeContext.tsx';
import type { TAppThemeContext } from '@/features/theme/AppTheme.types.ts';
import type { ImageRequest } from '@/lib/requests/RequestManager.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { noOp } from '@/lib/HelperFunctions.ts';

export const Thumbnail = ({
    manga,
    mangaDynamicColorSchemes,
}: {
    manga: Partial<MangaThumbnailInfo>;
    mangaDynamicColorSchemes: boolean;
}) => {
    const { setDynamicColor } = useAppThemeContext();

    const popupState = usePopupState({ variant: 'popover', popupId: 'manga-thumbnail-fullscreen' });

    const [isImageReady, setIsImageReady] = useState(false);

    const url = Mangas.getThumbnailUrl(manga);

    useLayoutEffect(() => {
        if (!mangaDynamicColorSchemes) {
            return () => {};
        }

        let aborted = false;
        let imageRequest: ImageRequest = {
            response: Promise.resolve(''),
            cleanup: noOp,
            abortRequest: noOp,
            fromCache: false,
        };
        const fetchImage = async () => {
            imageRequest = await requestManager.requestImage(url);
            const image = await imageRequest.response;

            if (aborted) {
                return;
            }

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = image;

            img.onload = () => {
                if (aborted) {
                    return;
                }

                const isLargeImage = img.width > 600 && img.height > 900;

                Promise.all([
                    Vibrant.from(img).getPalette(),
                    new FastAverageColor().getColor(img, {
                        algorithm: 'dominant',
                        mode: isLargeImage ? 'speed' : 'precision',
                        ignoredColor: [
                            [255, 255, 255, 255, 75],
                            [0, 0, 0, 255, 75],
                        ],
                    }),
                ]).then(([palette, averageColor]) => {
                    if (aborted) {
                        return;
                    }

                    if (
                        !palette.Vibrant ||
                        !palette.DarkVibrant ||
                        !palette.LightVibrant ||
                        !palette.LightMuted ||
                        !palette.Muted ||
                        !palette.DarkMuted
                    ) {
                        return;
                    }

                    setDynamicColor({
                        ...palette,
                        average: averageColor,
                    } as TAppThemeContext['dynamicColor']);
                });
            };
        };

        fetchImage().catch(() => {});

        return () => {
            aborted = true;
            imageRequest.abortRequest();
            imageRequest.cleanup();
            setDynamicColor(null);
        };
    }, [url, mangaDynamicColorSchemes]);

    return (
        <>
            <ButtonBase
                {...bindTrigger(popupState)}
                disabled={!isImageReady}
                sx={{
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                    width: { xs: 100, lg: 200, xl: 300 },
                    borderRadius: M3_SHAPE.extraSmall,
                    overflow: 'hidden',
                }}
            >
                <CoverImage src={url} alt="Manga Thumbnail" onLoad={() => setIsImageReady(true)} sx={{ width: 1 }} />
            </ButtonBase>
            <Modal {...bindPopover(popupState)} sx={{ outline: 0 }}>
                <Stack
                    onClick={() => popupState.close()}
                    sx={{ height: '100vh', p: 2, outline: 0, justifyContent: 'center', alignItems: 'center' }}
                >
                    <SpinnerImage
                        src={url}
                        alt="Manga Thumbnail"
                        imgStyle={{ height: '100%', width: '100%', objectFit: 'contain' }}
                    />
                </Stack>
            </Modal>
        </>
    );
};
