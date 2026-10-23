/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import IconButton from '@mui/material/IconButton';
import { AwaitableComponent } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { useAppThemeContext } from '@/features/theme/AppThemeContext.tsx';
import type { AppTheme } from '@/features/theme/services/AppThemes.ts';
import { createTheme } from '@/features/theme/services/ThemeCreator.ts';
import { ThemeCreationDialog } from '@/features/theme/components/CreateThemeDialog.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ThemeFontLoader } from '@/features/theme/services/ThemeFontLoader.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { MANGA_COVER_ASPECT_RATIO } from '@/features/manga/Manga.constants.ts';

/**
 * Mihon's theme previews are 114 px wide.
 */
export const THEME_PREVIEW_WIDTH = 114;

/**
 * The tile of Mihon's theme picker: a phone-shaped 9:16 frame (4 px border, 17 px outer radius) with the label below.
 */
export const ThemePreviewTile = ({
    label,
    isSelected,
    onClick,
    children,
    actions,
}: {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    children: ReactNode;
    actions?: ReactNode;
}) => (
    <Stack sx={{ width: THEME_PREVIEW_WIDTH, flexShrink: 0, pt: 1, gap: 1 }}>
        <Box
            sx={{
                position: 'relative',
                aspectRatio: '9 / 16',
                p: '4px',
                border: '4px solid',
                borderColor: isSelected ? 'm3.primary' : 'm3.outlineVariant',
                borderRadius: '17px',
            }}
        >
            <ButtonBase
                onClick={onClick}
                aria-label={label}
                aria-pressed={isSelected}
                sx={{ width: '100%', height: '100%', borderRadius: '13px', overflow: 'hidden' }}
            >
                {children}
            </ButtonBase>
            {actions && (
                <Stack sx={{ position: 'absolute', top: 44, right: 8, gap: 0.5, alignItems: 'center' }}>
                    {actions}
                </Stack>
            )}
        </Box>
        <CustomTooltip title={label} placement="top">
            <TypographyMaxLines
                variant="bodyMedium"
                lines={2}
                sx={{ textAlign: 'center', opacity: SECONDARY_ALPHA, minHeight: '2lh' }}
            >
                {label}
            </TypographyMaxLines>
        </CustomTooltip>
    </Stack>
);

export const ThemePreview = ({ appTheme, onDelete }: { appTheme: AppTheme; onDelete: () => void }) => {
    const { getName } = appTheme;

    const { t } = useLingui();
    const { themeMode, setAppTheme, appTheme: activeAppTheme, shouldUsePureBlackMode } = useAppThemeContext();

    const isSelected = appTheme.id === activeAppTheme;

    // the colors are read from the preview theme directly, a nested ThemeProvider would also take over the color scheme
    const { m3 } = useMemo(
        () => createTheme(themeMode, appTheme, shouldUsePureBlackMode).palette,
        [appTheme, themeMode, shouldUsePureBlackMode],
    );

    const selectTheme = () => {
        const needToLoadFonts = ThemeFontLoader.hasMissing(appTheme.muiTheme);
        if (!needToLoadFonts) {
            setAppTheme(appTheme.id);
            return;
        }

        makeToast(t`Loading theme fonts…`, 'info');
        ThemeFontLoader.load(appTheme.muiTheme)
            .then(() => setAppTheme(appTheme.id))
            .catch((e) => makeToast(t`Could not load theme fonts`, 'error', getErrorMessage(e)));
    };

    return (
        <ThemePreviewTile
            label={getName()}
            isSelected={isSelected}
            onClick={selectTheme}
            actions={
                appTheme.isCustom && (
                    <>
                        <CustomTooltip title={t`Edit`} placement="auto">
                            <IconButton
                                aria-label={t`Edit`}
                                size="small"
                                onClick={() => AwaitableComponent.show(ThemeCreationDialog, { mode: 'edit', appTheme })}
                                sx={{ color: m3.onSurfaceVariant, bgcolor: m3.surfaceContainerHighest }}
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                        </CustomTooltip>
                        {!isSelected && (
                            <CustomTooltip title={t`Delete`} placement="auto">
                                <IconButton
                                    aria-label={t`Delete`}
                                    size="small"
                                    onClick={onDelete}
                                    sx={{ color: m3.onSurfaceVariant, bgcolor: m3.surfaceContainerHighest }}
                                >
                                    <DeleteRoundedIcon fontSize="small" />
                                </IconButton>
                            </CustomTooltip>
                        )}
                    </>
                )
            }
        >
            <Stack sx={{ width: '100%', height: '100%', alignItems: 'stretch', bgcolor: m3.background }}>
                {/* app bar */}
                <Stack sx={{ flexDirection: 'row', alignItems: 'center', height: 40, p: 1 }}>
                    <Box
                        sx={{
                            width: '70%',
                            height: '80%',
                            mr: 0.5,
                            borderRadius: M3_SHAPE.small,
                            bgcolor: m3.onSurface,
                        }}
                    />
                    <Stack sx={{ flexGrow: 1, alignItems: 'flex-end' }}>
                        {isSelected && <CheckCircleRoundedIcon aria-label={t`Selected`} sx={{ color: m3.primary }} />}
                    </Stack>
                </Stack>
                {/* cover with badges */}
                <Box
                    sx={{
                        width: '50%',
                        aspectRatio: MANGA_COVER_ASPECT_RATIO,
                        ml: 1,
                        mt: '2px',
                        p: 0.5,
                        borderRadius: M3_SHAPE.small,
                        bgcolor: m3.outlineVariant,
                    }}
                >
                    <Stack
                        sx={{ flexDirection: 'row', width: 24, height: 16, borderRadius: '5px', overflow: 'hidden' }}
                    >
                        <Box sx={{ width: 12, bgcolor: m3.tertiary }} />
                        <Box sx={{ width: 12, bgcolor: m3.secondary }} />
                    </Stack>
                </Box>
                {/* navigation bar */}
                <Stack
                    sx={{
                        mt: 'auto',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                        height: 32,
                        px: 1,
                        bgcolor: m3.surfaceContainer,
                    }}
                >
                    <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: m3.primary }} />
                    <Box
                        sx={{
                            flexGrow: 1,
                            height: 17,
                            borderRadius: M3_SHAPE.small,
                            bgcolor: alpha(m3.onSurface, 0.6),
                        }}
                    />
                </Stack>
            </Stack>
        </ThemePreviewTile>
    );
};
