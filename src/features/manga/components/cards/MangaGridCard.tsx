/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link as RouterLink } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { alpha, styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import { memo, useRef } from 'react';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { CoverImage } from '@/base/components/images/CoverImage.tsx';
import { MangaOptionButton } from '@/features/manga/components/MangaOptionButton.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import type { SpecificMangaCardProps } from '@/features/manga/Manga.types.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import {
    getMangaCardInteractionSx,
    MANGA_CARD_CONTROLS_Z_INDEX,
    MangaCardStateLayer,
} from '@/features/manga/components/cards/MangaCard.styles.tsx';

/**
 * Mihon dims the covers of selected items so the selection color shines through.
 */
const SELECTED_COVER_ALPHA = 0.76;

/**
 * Mihon's compact grid title scrim: the bottom third of the cover, fading to black at .667 alpha (0xAA).
 */
const COMPACT_TITLE_SCRIM_ALPHA = 0.667;

const GRID_ITEM_TITLE_LINES = 2;

/**
 * Mihon's "GridItemTitle": titleSmall at 12 / 18. Spacing around it has to be margin: padding would show the clamped
 * third line.
 */
const getGridItemTitleSx = (theme: Theme) => ({
    ...theme.typography.titleSmall,
    fontSize: theme.typography.pxToRem(12),
    lineHeight: theme.typography.pxToRem(18),
});

const CompactTitleScrim = styled('div')(({ theme }) => ({
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: '33%',
    background: `linear-gradient(to bottom, transparent, ${alpha(theme.palette.common.black, COMPACT_TITLE_SCRIM_ALPHA)})`,
}));

const CoverOverlayRow = styled(Stack)({
    position: 'absolute',
    zIndex: MANGA_CARD_CONTROLS_Z_INDEX,
    flexDirection: 'row',
    insetInline: 0,
});

const GridItemTitle = ({ title, sx }: { title: string; sx: SxProps<Theme> }) => (
    <CustomTooltip title={title} placement="top">
        <TypographyMaxLines component="h3" lines={GRID_ITEM_TITLE_LINES} sx={sx}>
            {title}
        </TypographyMaxLines>
    </CustomTooltip>
);

/**
 * Mihon's compact (title over the cover) and comfortable (title below the cover) grid items.
 */
export const MangaGridCard = memo(
    ({
        manga,
        longPressBind,
        popupState,
        mangaLinkTo,
        selected,
        inLibraryIndicator,
        isInLibrary,
        gridLayout,
        handleSelection,
        continueReadingButton,
        mangaBadges,
        mode,
    }: SpecificMangaCardProps) => {
        const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();
        const optionButtonRef = useRef<HTMLButtonElement>(null);

        const { id, title } = manga;
        const isComfortable = gridLayout === GridLayout.Comfortable;

        return (
            <ButtonBase
                component={RouterLink}
                className="MangaGridCard-root"
                disableRipple
                {...longPressBind(() => popupState.open(optionButtonRef.current))}
                to={mangaLinkTo}
                state={Mangas.createLocationState(manga, mode)}
                onContextMenu={preventMobileContextMenu}
                sx={MUIUtil.mergeSx(MediaQuery.preventMobileContextMenuSx(), getMangaCardInteractionSx(mode), {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    width: '100%',
                    p: 0.5,
                    borderRadius: M3_SHAPE.small,
                    textAlign: 'start',
                    color: selected ? 'm3.onSecondary' : 'm3.onSurface',
                    bgcolor: selected ? 'm3.secondary' : undefined,
                })}
            >
                <CoverImage
                    alt={title}
                    src={Mangas.getThumbnailUrl(manga)}
                    dimmed={inLibraryIndicator && isInLibrary}
                    // only the image fades, the badges, title and buttons on the cover stay opaque
                    sx={selected ? { '& img': { opacity: SELECTED_COVER_ALPHA } } : undefined}
                >
                    {!isComfortable && <CompactTitleScrim />}
                    <CoverOverlayRow sx={{ top: 0, p: 0.5, gap: 0.5, alignItems: 'start' }}>
                        <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0.5, flexGrow: 1 }}>
                            {mangaBadges}
                        </Stack>
                        <MangaOptionButton
                            ref={optionButtonRef}
                            popupState={popupState}
                            id={id}
                            selected={selected}
                            handleSelection={handleSelection}
                        />
                    </CoverOverlayRow>
                    <CoverOverlayRow sx={{ bottom: 0, alignItems: 'end', justifyContent: 'end' }}>
                        {!isComfortable && (
                            <GridItemTitle
                                title={title}
                                sx={(theme) => ({
                                    ...getGridItemTitleSx(theme),
                                    flexGrow: 1,
                                    m: 1,
                                    color: theme.palette.common.white,
                                    textShadow: `0 0 4px ${theme.palette.common.black}`,
                                })}
                            />
                        )}
                        {continueReadingButton}
                    </CoverOverlayRow>
                </CoverImage>
                {isComfortable && (
                    <GridItemTitle
                        title={title}
                        sx={(theme) => ({
                            ...getGridItemTitleSx(theme),
                            m: 0.5,
                            // Mihon reserves both lines, so the rows of the grid line up
                            minHeight: `calc(${GRID_ITEM_TITLE_LINES} * ${getGridItemTitleSx(theme).lineHeight})`,
                        })}
                    />
                )}
                <MangaCardStateLayer />
            </ButtonBase>
        );
    },
);
