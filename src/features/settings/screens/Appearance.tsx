/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import Switch from '@mui/material/Switch';
import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';
import { Trans, useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { useAppThemeContext } from '@/features/theme/AppThemeContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { i18nResources, loadCatalog } from '@/i18n';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { ThemeList } from '@/features/theme/components/ThemeList.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import type { MetadataThemeSettings } from '@/features/theme/AppTheme.types.ts';
import { ThemeMode } from '@/features/theme/AppTheme.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { MANGA_GRID_WIDTH, SERVER_SETTINGS_METADATA_DEFAULT } from '@/features/settings/Settings.constants.ts';
import { MUI_THEME_MODE_KEY } from '@/lib/mui/MUI.constants.ts';
import { getISOLanguage } from '@/lib/ISOLanguageUtil.ts';
import { PreferenceList } from '@/features/settings/components/PreferenceList.tsx';
import { SelectPreference } from '@/features/settings/components/SelectPreference.tsx';
import { InfoPreference } from '@/features/settings/components/InfoPreference.tsx';
import { SelectButton } from '@/base/components/buttons/SelectButton.tsx';
import { segmentedButtonGroupSx } from '@/features/theme/m3/M3ConnectedButtonGroup.ts';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import type { ValueToDisplayData } from '@/base/Base.types.ts';

// Mihon's order
const THEME_MODES = [ThemeMode.SYSTEM, ThemeMode.LIGHT, ThemeMode.DARK];

// the check only shows on the selected segment
const THEME_MODE_DISPLAY_DATA: ValueToDisplayData<ThemeMode> = {
    [ThemeMode.SYSTEM]: { title: msg`System`, icon: <CheckRoundedIcon /> },
    [ThemeMode.LIGHT]: { title: msg`Light`, icon: <CheckRoundedIcon /> },
    [ThemeMode.DARK]: { title: msg`Dark`, icon: <CheckRoundedIcon /> },
};

// Inline links in small text: padding widens the touch target to iOS's 44 pt without moving the surrounding text
// (vertical padding of inline elements doesn't change the line height, the negative margin undoes the horizontal one).
const INLINE_LINK_SX = { py: '14px', px: 0.5, mx: -0.5 } satisfies SxProps<Theme>;

export const Appearance = () => {
    const { t } = useLingui();
    const { themeMode, setThemeMode, shouldUsePureBlackMode, setShouldUsePureBlackMode } = useAppThemeContext();
    const { mode, setMode } = useColorScheme();
    const actualThemeMode = (mode ?? themeMode) as ThemeMode;

    useAppTitle(t`Appearance`);

    const {
        settings: { mangaThumbnailBackdrop, mangaDynamicColorSchemes, mangaGridItemWidth, locale },
        request: { loading, error, refetch },
    } = useMetadataServerSettings();
    const updateMetadataSetting = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const updateThemeMode = (newMode: ThemeMode) => {
        setThemeMode(newMode);
        setMode(newMode);
        // in case a non "colorSchemes" mui theme is active, "setMode" does not update the mode ("mui-mode") value
        AppStorage.local.setItem(MUI_THEME_MODE_KEY, newMode, true);
    };

    const isDarkMode = MediaQuery.getThemeMode(actualThemeMode) === ThemeMode.DARK;

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Appearance::refetch'))}
            />
        );
    }

    return (
        <PreferenceList>
            <List
                subheader={
                    <ListSubheader component="div" id="appearance-theme" customOffsetProps={{ sx: { zIndex: 2 } }}>
                        {t`Theme`}
                    </ListSubheader>
                }
            >
                {/* Mihon's segmented theme mode buttons share the row equally, without a visible label */}
                <SelectButton
                    value={actualThemeMode}
                    values={THEME_MODES}
                    setValue={updateThemeMode}
                    valueToDisplayData={THEME_MODE_DISPLAY_DATA}
                    slotProps={{
                        stack: {
                            role: 'group',
                            'aria-label': t`Theme mode`,
                            sx: [segmentedButtonGroupSx, { flexWrap: 'nowrap', px: 2, py: 1 }],
                        },
                        button: { sx: { flex: 1 } },
                    }}
                />
                <ThemeList />
                {isDarkMode && (
                    <ListItem>
                        <ListItemText primary={t`Pure black dark mode`} />
                        <Switch
                            checked={shouldUsePureBlackMode}
                            onChange={(_, enabled) => setShouldUsePureBlackMode(enabled)}
                        />
                    </ListItem>
                )}
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="appearance-display">
                        {t`Display`}
                    </ListSubheader>
                }
            >
                <SelectPreference
                    title={t`Language`}
                    value={locale}
                    options={i18nResources.map((language) => ({
                        value: language,
                        label: languageCodeToName(language),
                        description: getISOLanguage(language)?.name,
                    }))}
                    onChange={(newLocale) => {
                        updateMetadataSetting('locale', newLocale).catch((e) =>
                            makeToast(t`Could not save changes`, 'error', getErrorMessage(e)),
                        );
                        loadCatalog(newLocale).catch((e: Error) => {
                            makeToast(t`Could not load language`, 'error', getErrorMessage(e));
                        });
                    }}
                />
                <InfoPreference>
                    <Trans>
                        Feel free to translate the project on Weblate (
                        <Link
                            href="https://hosted.weblate.org/projects/suwayomi/suwayomi-webui"
                            sx={INLINE_LINK_SX}
                            target="_blank"
                            rel="noreferrer"
                        >
                            WebUI
                        </Link>{' '}
                        and{' '}
                        <Link
                            href="https://hosted.weblate.org/projects/suwayomi/suwayomi-server"
                            sx={INLINE_LINK_SX}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Server
                        </Link>
                        )
                    </Trans>
                </InfoPreference>
                <NumberSetting
                    settingTitle={t`Manga item width`}
                    settingValue={`px: ${mangaGridItemWidth}`}
                    value={mangaGridItemWidth}
                    defaultValue={SERVER_SETTINGS_METADATA_DEFAULT.mangaGridItemWidth}
                    minValue={MANGA_GRID_WIDTH.min}
                    maxValue={MANGA_GRID_WIDTH.max}
                    stepSize={MANGA_GRID_WIDTH.step}
                    valueUnit="px"
                    showSlider
                    handleUpdate={(width) => updateMetadataSetting('mangaGridItemWidth', width)}
                />

                <ListItem>
                    <ListItemText
                        primary={t`Manga thumbnail as background`}
                        secondary={t`Sets the manga thumbnail as the background image on the manga page`}
                    />
                    <Switch
                        edge="end"
                        checked={mangaThumbnailBackdrop}
                        onChange={(e) => updateMetadataSetting('mangaThumbnailBackdrop', e.target.checked)}
                    />
                </ListItem>

                <ListItem>
                    <ListItemText
                        primary={t`Dynamic theme colors on manga page`}
                        secondary={t`Changes the theme colors on the manga page based on the thumbnail`}
                    />
                    <Switch
                        edge="end"
                        checked={mangaDynamicColorSchemes}
                        onChange={(e) => updateMetadataSetting('mangaDynamicColorSchemes', e.target.checked)}
                    />
                </ListItem>
            </List>
        </PreferenceList>
    );
};
