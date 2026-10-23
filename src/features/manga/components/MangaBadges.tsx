/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import CollectionsBookmarkRounded from '@mui/icons-material/CollectionsBookmarkRounded';
import FolderRounded from '@mui/icons-material/FolderRounded';
import type { ComponentProps } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import type { MangaCardMode } from '@/features/manga/Manga.types.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import type { TextBadgeColor } from '@/base/components/badges/TextBadge.tsx';
import { TextBadge, TextBadgeGroup } from '@/base/components/badges/TextBadge.tsx';

const IconBadge = ({
    label,
    icon,
    color,
    className,
    sx,
}: {
    label: string;
    icon: ComponentProps<typeof TextBadge>['icon'];
    color?: TextBadgeColor;
    className?: string;
    sx?: SxProps<Theme>;
}) => (
    <TextBadgeGroup role="img" aria-label={label} className={className} sx={sx}>
        <TextBadge icon={icon} color={color} />
    </TextBadgeGroup>
);

/**
 * Mihon's cover badges: an icon badge for entries already in the library (browse), the download (tertiary) and
 * unread (secondary) counts, and at the end a folder badge for entries of the local source.
 *
 * Renders the badge groups side by side; the card places them (top of the cover, or the end of a list row).
 */
export const MangaBadges = ({
    inLibraryIndicator,
    updateLibraryState,
    isInLibrary,
    unread,
    downloadCount,
    isLocal = false,
    mode,
}: {
    inLibraryIndicator?: boolean;
    updateLibraryState: () => void;
    isInLibrary: boolean;
    unread?: number;
    downloadCount?: number;
    isLocal?: boolean;
    mode: MangaCardMode;
}) => {
    const { t } = useLingui();

    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const {
        settings: { showUnreadBadge, showDownloadBadge },
    } = useMetadataServerSettings();

    const showDownloadCount =
        ((showDownloadBadge && mode === 'default') || mode === 'duplicate') && (downloadCount ?? 0) > 0;
    const showUnreadCount = ((showUnreadBadge && mode === 'default') || mode === 'duplicate') && (unread ?? 0) > 0;
    const showLocalBadge = isLocal && (mode === 'default' || mode === 'duplicate');

    return (
        <>
            {!isTouchDevice && inLibraryIndicator && mode === 'source' && (
                <Button
                    className="source-manga-library-state-button"
                    component="div"
                    variant="contained"
                    size="small"
                    {...MUIUtil.preventRippleProp()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateLibraryState();
                    }}
                    sx={{
                        display: 'none',
                    }}
                    color={isInLibrary ? 'error' : 'primary'}
                >
                    {isInLibrary ? t`Remove from the library` : t`Add To Library`}
                </Button>
            )}
            {inLibraryIndicator && isInLibrary && (
                <IconBadge
                    label={t`In Library`}
                    icon={CollectionsBookmarkRounded}
                    className="source-manga-library-state-indicator"
                />
            )}
            {(showDownloadCount || showUnreadCount) && (
                <TextBadgeGroup>
                    {showDownloadCount && <TextBadge color="tertiary">{downloadCount}</TextBadge>}
                    {showUnreadCount && <TextBadge>{unread}</TextBadge>}
                </TextBadgeGroup>
            )}
            {showLocalBadge && (
                // Mihon's end badge group
                <IconBadge
                    label={t`Local source`}
                    icon={FolderRounded}
                    color="tertiary"
                    sx={{ marginInlineStart: 'auto' }}
                />
            )}
        </>
    );
};
