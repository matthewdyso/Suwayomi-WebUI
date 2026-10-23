/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import Typography from '@mui/material/Typography';
import type { TypographyProps } from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useElementSize } from '@mantine/hooks';
import { useLingui } from '@lingui/react/macro';
import { t as translate } from '@lingui/core/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { TrackMangaButton } from '@/features/manga/components/TrackMangaButton.tsx';
import { useManageMangaLibraryState } from '@/features/manga/hooks/useManageMangaLibraryState.tsx';
import type { MangaType, SourceType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { MangaStatus } from '@/lib/graphql/generated/graphql-base.types.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { MANGA_STATUS_TO_TRANSLATION } from '@/features/manga/Manga.constants.ts';
import type {
    MangaArtistInfo,
    MangaAuthorInfo,
    MangaDescriptionInfo,
    MangaGenreInfo,
    MangaIdInfo,
    MangaInLibraryInfo,
    MangaLocationState,
    MangaMetaInfo,
    MangaSourceIdInfo,
    MangaStatusInfo,
    MangaThumbnailInfo,
    MangaTitleInfo,
    MangaTrackRecordInfo,
} from '@/features/manga/Manga.types.ts';
import { Sources } from '@/features/source/services/Sources.ts';
import type { SourceIdInfo } from '@/features/source/Source.types.ts';
import { Thumbnail } from '@/features/manga/components/details/Thumbnail.tsx';
import { DescriptionGenre } from '@/features/manga/components/details/DescriptionGenre.tsx';
import { SearchLink } from '@/features/manga/components/details/SearchLink.tsx';
import { MangaActionButton } from '@/features/manga/components/details/MangaActionButton.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { copyToClipboard, noOp } from '@/lib/HelperFunctions.ts';
import { usePress } from '@/base/hooks/usePress.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useAppBarOverlay } from '@/features/navigation-bar/hooks/useAppBarOverlay.ts';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';

type IconComponent = OverridableComponent<SvgIconTypeMap>;

const MANGA_STATUS_TO_ICON: Record<MangaStatus, IconComponent> = {
    [MangaStatus.Cancelled]: CloseRoundedIcon,
    [MangaStatus.Completed]: DoneAllRoundedIcon,
    [MangaStatus.Licensed]: AttachMoneyRoundedIcon,
    [MangaStatus.Ongoing]: ScheduleRoundedIcon,
    [MangaStatus.OnHiatus]: PauseRoundedIcon,
    [MangaStatus.PublishingFinished]: DoneRoundedIcon,
    [MangaStatus.Unknown]: BlockRoundedIcon,
};

const INFO_ICON_SIZE = 16;

/**
 * Mihon's "MangaInfoBox" backdrop: the cover blurred by 4 dp at .2 alpha.
 */
const BACKDROP_BLUR_PX = 4;
const BACKDROP_ALPHA = 0.2;

const DetailsWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        flexBasis: '40%',
        height: `calc(100vh - var(${M3_CSS_VARIABLE.appBarHeight}))`,
        overflowY: 'auto',
    },
}));

/**
 * Mihon's manga info backdrop: the blurred cover, faded into the surface, behind the status bar, app bar and info.
 */
const Backdrop = ({ url }: { url: string }) => (
    <Box
        aria-hidden
        sx={(theme) => ({
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(transparent, ${theme.palette.m3.surface})`,
            },
        })}
    >
        <SpinnerImage
            spinnerStyle={{ display: 'none' }}
            imgStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: `blur(${BACKDROP_BLUR_PX}px)`,
                opacity: BACKDROP_ALPHA,
            }}
            src={url}
            alt=""
        />
    </Box>
);

const InfoLine = ({ icon: Icon, children }: { icon: IconComponent; children: ReactNode }) => (
    <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 0.5, opacity: SECONDARY_ALPHA }}>
        <Icon sx={{ fontSize: INFO_ICON_SIZE }} />
        {children}
    </Stack>
);

/**
 * Long pressing copies "text" where the clipboard is available (Mihon's title, author and artist). A tap still reaches
 * the links inside or around it; pointer devices get a hint, since a long click is hard to discover with a mouse.
 */
const CopyableText = ({
    text,
    variant,
    component,
    children,
}: {
    text: string;
    variant: TypographyProps['variant'];
    component: 'h2' | 'span';
    children: ReactNode;
}) => {
    const { t } = useLingui();
    const canCopy = !!navigator.clipboard;
    const isTouchDevice = MediaQuery.useIsTouchDevice();
    const longPressBind = usePress({ onLongPress: () => copyToClipboard(text), onPress: noOp });
    const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

    if (!canCopy) {
        return (
            <Typography variant={variant} component={component} sx={{ wordBreak: 'break-word' }}>
                {children}
            </Typography>
        );
    }

    // the click after a long press is cancelled in the capture phase, before a link inside handles it
    const { onClick: cancelClickAfterLongPress, ...longPressHandlers } = longPressBind();

    return (
        <CustomTooltip title={t`Long press to copy`} disabled={isTouchDevice}>
            <Typography
                {...longPressHandlers}
                onClickCapture={cancelClickAfterLongPress}
                onContextMenu={preventMobileContextMenu}
                variant={variant}
                component={component}
                sx={{ wordBreak: 'break-word', WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
                {children}
            </Typography>
        </CustomTooltip>
    );
};

function getSourceName(source?: Pick<SourceType, 'id' | 'displayName'> | null): string {
    if (!source) {
        return translate`Unknown`;
    }

    if (Sources.isLocalSource(source)) {
        return translate`Local source`;
    }

    return source.displayName ?? source.id;
}

const valuesToJoinedSearchLinks = (
    values: string[] | undefined,
    sourceId: SourceIdInfo['id'] | undefined,
    mode: MangaLocationState['mode'],
) =>
    values
        ?.map((value) => <SearchLink key={value} query={value} sourceId={sourceId} mode={mode} />)
        .reduce((acc, valueLink) => (
            <>
                {acc}, {valueLink}
            </>
        ));

export const MangaDetails = ({
    manga,
    mode,
    isSingleColumn,
}: {
    manga: Pick<MangaType, 'realUrl'> &
        MangaIdInfo &
        MangaTitleInfo &
        MangaStatusInfo &
        MangaInLibraryInfo &
        MangaAuthorInfo &
        MangaArtistInfo &
        MangaDescriptionInfo &
        MangaGenreInfo &
        MangaThumbnailInfo &
        MangaSourceIdInfo &
        MangaTrackRecordInfo &
        MangaMetaInfo & {
            source?: Pick<SourceType, 'id' | 'displayName'> | null;
        };
    mode: MangaLocationState['mode'];
    /**
     * The details scroll with the window, under the transparent app bar.
     */
    isSingleColumn: boolean;
}) => {
    const { t } = useLingui();
    const { appBarHeight } = useNavBarContext();

    const {
        settings: { mangaThumbnailBackdrop, mangaDynamicColorSchemes },
    } = useMetadataServerSettings();

    const { ref: infoRef, height: infoHeight } = useElementSize();
    useAppBarOverlay(isSingleColumn, Math.max(0, infoHeight - appBarHeight));

    useEffect(() => {
        if (!manga.source) {
            makeToast(t`Could not find source. Check your installed extensions.`, 'error');
        }
    }, [manga.source, t]);

    const { updateLibraryState } = useManageMangaLibraryState(manga);

    const authors = Mangas.getAuthors(manga);
    const artists = Mangas.getArtists(manga);
    const separateArtist = manga.artist !== manga.author ? manga.artist : null;
    const StatusIcon = MANGA_STATUS_TO_ICON[manga.status];

    return (
        <DetailsWrapper>
            <Box ref={infoRef} sx={{ position: 'relative' }}>
                {mangaThumbnailBackdrop && <Backdrop url={Mangas.getThumbnailUrl(manga)} />}
                <Stack
                    sx={{
                        position: 'relative',
                        flexDirection: 'row',
                        // the titles are centred beside the cover, which stays at the top (Mihon)
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        pt: { xs: `calc(var(${M3_CSS_VARIABLE.appBarHeight}) + 16px)`, md: 2 },
                    }}
                >
                    <Thumbnail manga={manga} mangaDynamicColorSchemes={mangaDynamicColorSchemes} />
                    <Stack sx={{ gap: '2px', minWidth: 0, color: 'm3.onSurface' }}>
                        {/* tapping the title searches it globally (Mihon) */}
                        <SearchLink query={manga.title} sourceId={manga.sourceId} mode="source.global-search">
                            <CopyableText text={manga.title} variant="titleLarge" component="h2">
                                {manga.title}
                            </CopyableText>
                        </SearchLink>
                        <InfoLine icon={PersonRoundedIcon}>
                            {manga.author ? (
                                <CopyableText text={manga.author} variant="titleSmall" component="span">
                                    {valuesToJoinedSearchLinks(authors, manga.source?.id, mode)}
                                </CopyableText>
                            ) : (
                                <Typography variant="titleSmall" component="span">
                                    {t`Unknown author`}
                                </Typography>
                            )}
                        </InfoLine>
                        {separateArtist && (
                            <InfoLine icon={BrushRoundedIcon}>
                                <CopyableText text={separateArtist} variant="titleSmall" component="span">
                                    {valuesToJoinedSearchLinks(artists, manga.source?.id, mode)}
                                </CopyableText>
                            </InfoLine>
                        )}
                        <InfoLine icon={StatusIcon}>
                            <Typography variant="bodyMedium" component="span" noWrap>
                                {`${t(MANGA_STATUS_TO_TRANSLATION[manga.status])} • ${getSourceName(manga.source)}`}
                            </Typography>
                        </InfoLine>
                    </Stack>
                </Stack>
            </Box>
            <Stack sx={{ flexDirection: 'row', px: 2, pt: 1 }}>
                <MangaActionButton
                    active={manga.inLibrary}
                    icon={manga.inLibrary ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                    label={manga.inLibrary ? t`In Library` : t`Add To Library`}
                    onClick={updateLibraryState}
                />
                <TrackMangaButton manga={manga} />
                <MangaActionButton
                    active={!!manga.realUrl}
                    icon={<PublicRoundedIcon />}
                    label={t`WebView`}
                    disabled={!manga.realUrl}
                    href={manga.realUrl ? requestManager.getWebviewUrl(manga.realUrl) : undefined}
                    target="_blank"
                    rel="noreferrer"
                />
                <MangaActionButton
                    active={!!manga.realUrl}
                    icon={<OpenInNewRoundedIcon />}
                    label={t`Browser`}
                    disabled={!manga.realUrl}
                    href={manga.realUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                />
            </Stack>
            <DescriptionGenre manga={manga} mode={mode} />
        </DetailsWrapper>
    );
};
