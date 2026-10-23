/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { memo, useRef } from 'react';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { CoverImage } from '@/base/components/images/CoverImage.tsx';
import type { SpecificMangaCardProps } from '@/features/manga/Manga.types.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { MangaOptionButton } from '@/features/manga/components/MangaOptionButton.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import {
    getMangaCardInteractionSx,
    MANGA_CARD_CONTROLS_Z_INDEX,
    MangaCardStateLayer,
} from '@/features/manga/components/cards/MangaCard.styles.tsx';

/**
 * Mihon's library list item: 56 px row with a square cover, a two line title, the badges and the continue button.
 */
export const MangaListCard = memo(
    ({
        manga,
        longPressBind,
        popupState,
        mangaLinkTo,
        selected,
        inLibraryIndicator,
        isInLibrary,
        handleSelection,
        continueReadingButton,
        mangaBadges,
        mode,
    }: SpecificMangaCardProps) => {
        const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

        const optionButtonRef = useRef<HTMLButtonElement>(null);

        const { id, title } = manga;

        return (
            <ButtonBase
                component={RouterLink}
                className="MangaListCard-root"
                disableRipple
                to={mangaLinkTo}
                state={Mangas.createLocationState(manga, mode)}
                {...longPressBind(() => popupState.open(optionButtonRef.current))}
                onContextMenu={preventMobileContextMenu}
                sx={MUIUtil.mergeSx(MediaQuery.preventMobileContextMenuSx(), getMangaCardInteractionSx(mode), {
                    display: 'flex',
                    justifyContent: 'flex-start',
                    width: '100%',
                    height: 56,
                    px: 2,
                    py: 1,
                    textAlign: 'start',
                    color: 'm3.onSurface',
                    bgcolor: selected ? 'm3.selected' : undefined,
                })}
            >
                <CoverImage
                    ratio="square"
                    small
                    alt={title}
                    src={Mangas.getThumbnailUrl(manga)}
                    dimmed={inLibraryIndicator && isInLibrary}
                    sx={{ height: '100%' }}
                />
                <CustomTooltip title={title} placement="top">
                    <TypographyMaxLines variant="bodyMedium" component="h3" sx={{ flexGrow: 1, minWidth: 0, px: 2 }}>
                        {title}
                    </TypographyMaxLines>
                </CustomTooltip>
                <Stack
                    sx={{
                        position: 'relative',
                        zIndex: MANGA_CARD_CONTROLS_Z_INDEX,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>{mangaBadges}</Stack>
                    {continueReadingButton}
                    <MangaOptionButton
                        ref={optionButtonRef}
                        popupState={popupState}
                        id={id}
                        selected={selected}
                        handleSelection={handleSelection}
                        asCheckbox
                    />
                </Stack>
                <MangaCardStateLayer />
            </ButtonBase>
        );
    },
);
