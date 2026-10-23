/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import type { Ref } from 'react';
import { memo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import type { MobileHeaderProps } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ReaderLibraryButton } from '@/features/reader/overlay/navigation/components/ReaderLibraryButton.tsx';
import { ReaderBookmarkButton } from '@/features/reader/overlay/navigation/components/ReaderBookmarkButton.tsx';
import { FALLBACK_CHAPTER } from '@/features/chapter/Chapter.constants.ts';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';
import { ReaderExitButton } from '@/features/reader/overlay/navigation/components/ReaderExitButton.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    useReaderChaptersStore,
    useReaderScrollbarStore,
    useReaderStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ShareGuard } from '@/base/components/guard/ShareGuard.tsx';
import { getReaderBarVisibilitySx } from '@/features/reader/overlay/ReaderOverlay.utils.ts';

const DEFAULT_MANGA = { ...FALLBACK_MANGA, title: '' };

/**
 * Mihon's "ReaderTopBar": back, manga title and chapter name, the actions and an overflow menu for the rest.
 */
const BaseReaderOverlayHeaderMobile = ({ isVisible, ref }: MobileHeaderProps & { ref?: Ref<HTMLDivElement> }) => {
    const { t } = useLingui();
    const popupState = usePopupState({ popupId: 'reader-overlay-more-menu', variant: 'popover' });
    const currentChapter = useReaderChaptersStore('currentChapter');

    const manga = useReaderStore('manga');
    const scrollbar = useReaderScrollbarStore((state) => state);

    const { id: mangaId, title } = manga ?? DEFAULT_MANGA;
    const { id: chapterId, name, realUrl, isBookmarked } = currentChapter ?? FALLBACK_CHAPTER;

    return (
        <Stack
            ref={ref}
            component="header"
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: `${scrollbar.ySize}px`,
                pt: 'env(safe-area-inset-top)',
                pl: 'env(safe-area-inset-left)',
                pr: 'env(safe-area-inset-right)',
                bgcolor: 'm3.readerBar',
                color: 'm3.onSurface',
                pointerEvents: 'all',
                ...getReaderBarVisibilitySx(isVisible, 'top'),
            }}
        >
            <Toolbar sx={{ gap: 0.5 }}>
                <ReaderExitButton />
                <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                    {manga && currentChapter ? (
                        <>
                            <CustomTooltip title={title}>
                                <TypographyMaxLines lines={1} component="h1" variant="titleLarge">
                                    <Link
                                        component={RouterLink}
                                        to={AppRoutes.manga.path(mangaId)}
                                        sx={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {title}
                                    </Link>
                                </TypographyMaxLines>
                            </CustomTooltip>
                            <CustomTooltip title={name}>
                                <TypographyMaxLines lines={1} variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                                    {name}
                                </TypographyMaxLines>
                            </CustomTooltip>
                        </>
                    ) : (
                        <LoadingPlaceholder />
                    )}
                </Stack>
                <ReaderLibraryButton />
                <ReaderBookmarkButton id={chapterId} isBookmarked={isBookmarked} />
                <CustomTooltip title={t`More`}>
                    <IconButton {...bindTrigger(popupState)} color="inherit">
                        <MoreVertRoundedIcon />
                    </IconButton>
                </CustomTooltip>
            </Toolbar>
            <Menu {...bindMenu(popupState)}>
                <MenuItem
                    component={Link}
                    disabled={!realUrl}
                    href={realUrl ?? ''}
                    rel="noreferrer"
                    target="_blank"
                    onClick={popupState.close}
                >
                    {t`Open in browser`}
                </MenuItem>
                <MenuItem
                    component={Link}
                    disabled={!realUrl}
                    href={realUrl ? requestManager.getWebviewUrl(realUrl) : ''}
                    rel="noreferrer"
                    target="_blank"
                    onClick={popupState.close}
                >
                    {t`Open in WebView`}
                </MenuItem>
                <ShareGuard>
                    <MenuItem
                        disabled={!realUrl}
                        onClick={() => {
                            popupState.close();
                            navigator
                                .share({
                                    title: `${title} — ${name}`,
                                    text: name,
                                    url: realUrl ?? undefined,
                                })
                                .catch(defaultPromiseErrorHandler('ReaderOverlayHeaderMobile::share'));
                        }}
                    >
                        {t`Share`}
                    </MenuItem>
                </ShareGuard>
            </Menu>
        </Stack>
    );
};

export const ReaderOverlayHeaderMobile = memo(BaseReaderOverlayHeaderMobile);
