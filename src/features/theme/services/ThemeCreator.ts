/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type {
    ColorSystemOptions,
    CssVarsThemeOptions,
    Direction,
    PaletteColorOptions,
    PaletteOptions,
    Theme,
} from '@mui/material/styles';
import { createTheme as createMuiTheme, useTheme } from '@mui/material/styles';
import { useCallback } from 'react';
// oxlint-disable-next-line no-restricted-imports
import { deepmerge } from '@mui/utils';
import type { AppTheme } from '@/features/theme/services/AppThemes.ts';
import type { themes } from '@/features/theme/Themes.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { TAppThemeContext } from '@/features/theme/AppTheme.types.ts';
import { ThemeMode } from '@/features/theme/AppTheme.types.ts';
import { ThemeFontLoader } from '@/features/theme/services/ThemeFontLoader.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import type { M3Mode, M3Palette } from '@/features/theme/m3/M3.types.ts';
import { createM3Palette, createMuiPaletteFromM3 } from '@/features/theme/m3/M3Color.utils.ts';
import { createM3TypographyOptions } from '@/features/theme/m3/M3Typography.utils.ts';
import { M3_FONT_FAMILY } from '@/features/theme/m3/M3Typography.constants.ts';
import { MUI_BORDER_RADIUS } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_SHADOWS } from '@/features/theme/m3/M3Elevation.constants.ts';
import { M3_MUI_TRANSITIONS } from '@/features/theme/m3/M3Motion.constants.ts';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';
import { createM3ComponentOverrides } from '@/features/theme/m3/M3ComponentOverrides.ts';

type MuiThemeOptions = AppTheme['muiTheme'];
type ThemeComponents = NonNullable<CssVarsThemeOptions['components']>;
type CssBaselineOverrides = NonNullable<NonNullable<ThemeComponents['MuiCssBaseline']>['styleOverrides']>;
type CssBaselineTheme = Parameters<Extract<CssBaselineOverrides, (theme: never) => unknown>>[0];

/**
 * The default theme uses Mihon's color scheme as is instead of generating one from a seed color.
 */
const DEFAULT_APP_THEME_ID: keyof typeof themes = 'default';

const OTHER_MODE: Record<M3Mode, M3Mode> = {
    light: 'dark',
    dark: 'light',
};

const getSchemePalette = (muiTheme: MuiThemeOptions, mode: M3Mode): PaletteOptions | undefined => {
    const colorScheme: boolean | ColorSystemOptions | undefined = muiTheme.colorSchemes?.[mode];

    return typeof colorScheme === 'object' ? colorScheme.palette : undefined;
};

const getMainColor = (color: PaletteColorOptions | undefined): string | undefined =>
    color && 'main' in color ? color.main : undefined;

const createM3PaletteOfAppTheme = (
    appTheme: AppTheme,
    mode: M3Mode,
    pureBlack: boolean,
    dynamicColor: TAppThemeContext['dynamicColor'],
): M3Palette => {
    if (dynamicColor) {
        return createM3Palette({ seed: dynamicColor.Vibrant.hex, mode, pureBlack });
    }

    if (appTheme.id === DEFAULT_APP_THEME_ID) {
        return createM3Palette({ mode, pureBlack });
    }

    const palette = getSchemePalette(appTheme.muiTheme, mode);
    // themes that only define one mode seed the other mode with the same colors
    const seedPalette = palette ?? getSchemePalette(appTheme.muiTheme, OTHER_MODE[mode]);

    return createM3Palette({
        seed: getMainColor(seedPalette?.primary),
        tertiarySeed: getMainColor(seedPalette?.secondary),
        backgroundOverride: palette?.background?.default ?? palette?.background?.paper,
        mode,
        pureBlack,
    });
};

const createColorScheme = (
    appTheme: AppTheme,
    mode: M3Mode,
    pureBlack: boolean,
    dynamicColor: TAppThemeContext['dynamicColor'],
): ColorSystemOptions => {
    // the seed colors are consumed by the M3 palette; any other palette option of a custom theme still applies
    const { primary, secondary, background, ...customPalette } = getSchemePalette(appTheme.muiTheme, mode) ?? {};

    return {
        palette: deepmerge(
            createMuiPaletteFromM3(createM3PaletteOfAppTheme(appTheme, mode, pureBlack, dynamicColor), mode),
            customPalette,
        ),
    };
};

const resolveCssBaselineOverrides = (overrides: CssBaselineOverrides, theme: CssBaselineTheme) =>
    typeof overrides === 'function' ? overrides(theme) : overrides;

type ComponentOptions = {
    defaultProps?: object;
    styleOverrides?: object;
    variants?: unknown[];
};

// "components" also holds plain flags (e.g. "mergeClassNameAndStyle"), which a custom theme just replaces
const isComponentOptions = (value: unknown): value is ComponentOptions => typeof value === 'object' && value !== null;

/**
 * Applies both the M3 and the custom style of a slot, the custom one last (MUI accepts an array of styles).
 */
const mergeSlotStyleOverrides = (m3: object | undefined, custom: object | undefined): object | undefined => {
    if (!m3 || !custom) {
        return custom ?? m3;
    }

    const m3Slots: Record<string, unknown> = { ...m3 };
    const customSlots = Object.entries(custom).map(([slot, style]) => [
        slot,
        slot in m3Slots ? [m3Slots[slot], style] : style,
    ]);

    return { ...m3Slots, ...Object.fromEntries(customSlots) };
};

const mergeComponentOptions = (m3: ComponentOptions, custom: ComponentOptions): ComponentOptions => ({
    ...m3,
    ...custom,
    defaultProps: deepmerge(m3.defaultProps ?? {}, custom.defaultProps ?? {}),
    styleOverrides: mergeSlotStyleOverrides(m3.styleOverrides, custom.styleOverrides),
    variants: [...(m3.variants ?? []), ...(custom.variants ?? [])],
});

/**
 * A custom theme's component options apply on top of the M3 ones. They get merged per slot, because the M3 overrides
 * are mostly functions, which a deep merge would replace with the custom theme's objects.
 */
const mergeComponents = (
    m3Components: ThemeComponents,
    customComponents: ThemeComponents | undefined,
): ThemeComponents => {
    if (!customComponents) {
        return m3Components;
    }

    const { MuiCssBaseline: customCssBaseline, ...otherCustomComponents } = customComponents;
    const mergedComponentsByName = Object.fromEntries(
        Object.entries(otherCustomComponents).map(([name, custom]) => {
            const m3: unknown = m3Components[name as keyof ThemeComponents];
            return [
                name,
                isComponentOptions(m3) && isComponentOptions(custom) ? mergeComponentOptions(m3, custom) : custom,
            ];
        }),
    );
    // each entry merges the options of one component, which keeps them valid options of that component
    const mergedComponents = { ...m3Components, ...mergedComponentsByName } as ThemeComponents;

    const m3CssBaselineOverrides = m3Components.MuiCssBaseline?.styleOverrides;
    const customCssBaselineOverrides = customCssBaseline?.styleOverrides;
    if (!m3CssBaselineOverrides || !customCssBaselineOverrides) {
        return { ...mergedComponents, MuiCssBaseline: customCssBaseline ?? m3Components.MuiCssBaseline };
    }

    return {
        ...mergedComponents,
        MuiCssBaseline: {
            ...customCssBaseline,
            styleOverrides: (theme) => [
                resolveCssBaselineOverrides(m3CssBaselineOverrides, theme),
                resolveCssBaselineOverrides(customCssBaselineOverrides, theme),
            ],
        },
    };
};

/**
 * Seeds a custom theme with the active dynamic (manga cover) color, e.g. to save it as a theme.
 */
export const createAppColorTheme = (
    appTheme: MuiThemeOptions,
    dynamicColor: TAppThemeContext['dynamicColor'],
): MuiThemeOptions => {
    if (!dynamicColor) {
        return appTheme;
    }

    const seedPalette = { palette: { primary: { main: dynamicColor.Vibrant.hex } } };

    return {
        ...appTheme,
        colorSchemes: {
            light: seedPalette,
            dark: seedPalette,
        },
    } satisfies MuiThemeOptions;
};

export const createTheme = (
    themeMode: ThemeMode,
    appTheme: AppTheme,
    pureBlackMode: boolean = false,
    direction: Direction = 'ltr',
    dynamicColor: TAppThemeContext['dynamicColor'] = null,
) => {
    const mode = MediaQuery.getThemeMode(themeMode);
    const { colorSchemes, typography, components, ...customOptions } = appTheme.muiTheme;
    const customTypography = typeof typography === 'object' ? typography : {};

    return createMuiTheme({
        shape: { borderRadius: MUI_BORDER_RADIUS },
        shadows: M3_SHADOWS,
        transitions: M3_MUI_TRANSITIONS,
        motion: { reducedMotion: 'system' },
        mixins: { toolbar: { minHeight: M3_LAYOUT.topAppBarHeight } },
        ...customOptions,
        colorSchemes: {
            light: createColorScheme(appTheme, ThemeMode.LIGHT, pureBlackMode, dynamicColor),
            dark: createColorScheme(appTheme, ThemeMode.DARK, pureBlackMode, dynamicColor),
        },
        defaultColorScheme: mode,
        direction,
        typography: deepmerge(
            createM3TypographyOptions(customTypography.fontFamily ?? M3_FONT_FAMILY),
            customTypography,
        ),
        components: mergeComponents(createM3ComponentOverrides(), components),
    } satisfies CssVarsThemeOptions);
};

let theme: Theme;
export const getCurrentTheme = () => theme;
export const createAndSetTheme = (...args: Parameters<typeof createTheme>) => {
    const [, appTheme] = args;

    theme = createTheme(...args);
    // only fonts of the theme itself get loaded, the default font is the platform's system font
    ThemeFontLoader.load(appTheme.muiTheme).catch(defaultPromiseErrorHandler('theme::createAndSetTheme'));

    return theme;
};

export const getOptionForDirection = <T>(
    ltrOption: T,
    rtlOption: T,
    direction: Theme['direction'] = theme?.direction ?? 'ltr',
): T => (direction === 'ltr' ? ltrOption : rtlOption);

export const useGetOptionForDirection = (): typeof getOptionForDirection => {
    const muiTheme = useTheme();

    return useCallback(
        <T>(...args: Parameters<typeof getOptionForDirection<T>>) => getOptionForDirection(...args),
        [muiTheme.direction],
    );
};
