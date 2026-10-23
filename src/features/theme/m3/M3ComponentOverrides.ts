/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CSSObject, CssVarsThemeOptions, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { buttonClasses } from '@mui/material/Button';
import { switchClasses } from '@mui/material/Switch';
import { sliderClasses } from '@mui/material/Slider';
import { chipClasses } from '@mui/material/Chip';
import { tabClasses } from '@mui/material/Tab';
import { listItemIconClasses } from '@mui/material/ListItemIcon';
import { listItemTextClasses } from '@mui/material/ListItemText';
import { listItemButtonClasses } from '@mui/material/ListItemButton';
import { menuItemClasses } from '@mui/material/MenuItem';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { filledInputClasses } from '@mui/material/FilledInput';
import { inputClasses } from '@mui/material/Input';
import { inputLabelClasses } from '@mui/material/InputLabel';
import { circularProgressClasses } from '@mui/material/CircularProgress';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';
import { buttonGroupClasses } from '@mui/material/ButtonGroup';
import { accordionClasses } from '@mui/material/Accordion';
import { alertClasses } from '@mui/material/Alert';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_ELEVATION } from '@/features/theme/m3/M3Elevation.constants.ts';
import { M3_DURATION, M3_EASING, M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';
import {
    DISABLED_ALPHA,
    M3_STATE_LAYER_ALPHA,
    SCRIM_ALPHA,
    STATUS_BAR_SCRIM_ALPHA,
    DISABLED_CONTAINER_ALPHA,
} from '@/features/theme/m3/M3Color.constants.ts';
import { applyStateLayer } from '@/features/theme/m3/M3Color.utils.ts';
import { M3_BUTTON, M3_CSS_VARIABLE, M3_LAYOUT, SCROLLBAR_SIZE } from '@/features/theme/m3/M3Layout.constants.ts';
import {
    CONNECTED_BUTTON_GROUP_FULL_RADIUS,
    CONNECTED_BUTTON_GROUP_GAP,
    connectedButtonGroupItemSx,
    connectedButtonGroupOuterCornersSx,
    connectedButtonGroupSelectedItemSx,
} from '@/features/theme/m3/M3ConnectedButtonGroup.ts';
import { M3_TYPOGRAPHY_VARIANT_MAPPING } from '@/features/theme/m3/M3Typography.utils.ts';
import { M3TabIndicator } from '@/features/theme/m3/M3TabIndicator.tsx';
import { m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

type M3Components = NonNullable<CssVarsThemeOptions['components']>;
type OverrideProps = { theme: Omit<Theme, 'components'> };

const M3_GAP_COLOR_VARIABLE = M3_CSS_VARIABLE.sliderGapColor;

const gapColor = ({ theme }: OverrideProps) => `var(${M3_GAP_COLOR_VARIABLE}, ${theme.palette.m3.surface})`;

const hoverOnly = (styles: CSSObject): CSSObject => ({ '@media (hover: hover)': { '&:hover': styles } });

const disabledContent = ({ theme }: OverrideProps) => alpha(theme.palette.m3.onSurface, DISABLED_ALPHA);

const disabledContainer = ({ theme }: OverrideProps) => alpha(theme.palette.m3.onSurface, DISABLED_CONTAINER_ALPHA);

/**
 * A 48 px touch target around a 24 px icon with a 40 px state layer: the transparent border is part of the hit box,
 * while the background (state layer) and the ripple stay inside the padding box.
 */
const touchTargetWithStateLayer: CSSObject = {
    padding: 8,
    border: '4px solid transparent',
    backgroundClip: 'padding-box',
};

/**
 * M3 Expressive press morph: the shape tightens while pressed and springs back.
 */
const pressMorph = (pressedRadius: string): CSSObject => ({
    '&:active': { borderRadius: pressedRadius },
});

/**
 * Restyles MUI's components to Material 3 Expressive (Mihon look). Colors are read from the active color scheme
 * ("theme.palette.m3"), so the same overrides serve light, dark and pure black.
 */
export const createM3ComponentOverrides = (): M3Components => ({
    MuiUseMediaQuery: {
        defaultProps: {
            noSsr: true,
        },
    },
    MuiTypography: {
        defaultProps: {
            // MUI renders unknown variants as "span"; text paragraphs of the M3 type scale should stay "p"
            variantMapping: M3_TYPOGRAPHY_VARIANT_MAPPING,
        },
    },
    MuiCssBaseline: {
        styleOverrides: (theme) => ({
            html: {
                backgroundColor: theme.palette.m3.surface,
                WebkitTapHighlightColor: 'transparent',
            },
            // MUI's own transitions follow "motion.reducedMotion"; this covers the spring transitions ("m3Transition")
            '@media (prefers-reduced-motion: reduce)': {
                ':root': {
                    [M3_CSS_VARIABLE.motionScale]: 0,
                },
            },
            body: {
                backgroundColor: theme.palette.m3.surface,
                // the safe-area inset is 0 outside the Home Screen app, so the scrim only shows there
                ...(theme.palette.mode === 'light' && {
                    '&::before': {
                        content: '""',
                        position: 'fixed',
                        zIndex: theme.zIndex.tooltip + 1,
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 'env(safe-area-inset-top)',
                        backgroundColor: alpha(theme.palette.m3.scrim, STATUS_BAR_SCRIM_ALPHA),
                        opacity: `var(${M3_CSS_VARIABLE.statusBarScrimOpacity}, 1)`,
                        // fades like the reader's bars, which it comes and goes with
                        transition: `opacity ${M3_DURATION.short3}ms ${M3_EASING.standard}`,
                        pointerEvents: 'none',
                    },
                }),
            },
            // only style the scrollbar of devices that support hovering; touch devices keep the native overlay scrollbar
            '@media (hover: hover)': {
                '*::-webkit-scrollbar': {
                    width: SCROLLBAR_SIZE,
                    height: SCROLLBAR_SIZE,
                },
                '*::-webkit-scrollbar-thumb': {
                    border: '4px solid transparent',
                    backgroundClip: 'padding-box',
                    borderRadius: M3_SHAPE.full,
                    backgroundColor: theme.palette.m3.outline,
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    borderWidth: 2,
                },
            },
            // notistack's container: 8 px (6 px come from notistack's own padding per snackbar) above the navigation
            // bar or the home indicator
            'body .notistack-SnackbarContainer': {
                bottom: `calc(max(var(${M3_CSS_VARIABLE.bottomBarHeight}, 0px), env(safe-area-inset-bottom)) + 2px)`,
                maxWidth: 'min(560px, calc(100% - 16px))',
            },
        }),
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
            },
            rounded: {
                borderRadius: M3_SHAPE.medium,
            },
        },
    },
    MuiAppBar: {
        defaultProps: {
            elevation: 0,
            color: 'inherit',
        },
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surface,
                color: theme.palette.m3.onSurface,
                backgroundImage: 'none',
                borderRadius: 0,
                transition: m3Transition(['background-color'], M3_SPRING.defaultEffects),
            }),
        },
    },
    MuiToolbar: {
        styleOverrides: {
            root: {
                minHeight: M3_LAYOUT.topAppBarHeight,
            },
            gutters: ({ theme }) => ({
                paddingLeft: 4,
                paddingRight: 4,
                [theme.breakpoints.up('sm')]: {
                    paddingLeft: 4,
                    paddingRight: 4,
                },
            }),
        },
    },
    // the default color is MUI's "action.active" (onSurfaceVariant), "color" props keep working
    MuiIconButton: {
        styleOverrides: {
            root: {
                ...touchTargetWithStateLayer,
                variants: [
                    // the icon (not the hit box) lines up with the content edge
                    { props: { edge: 'start' }, style: { marginLeft: -12 } },
                    { props: { edge: 'end' }, style: { marginRight: -12 } },
                    { props: { size: 'small' }, style: { padding: 4 } },
                    { props: { edge: 'start', size: 'small' }, style: { marginLeft: -8 } },
                    { props: { edge: 'end', size: 'small' }, style: { marginRight: -8 } },
                ],
            },
        },
    },
    MuiButton: {
        defaultProps: {
            disableElevation: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.labelLarge,
                minHeight: M3_BUTTON.height.medium,
                minWidth: 48,
                padding: `0 ${M3_BUTTON.paddingInline.filled}px`,
                borderRadius: M3_SHAPE.full,
                transition: [
                    m3Transition(['border-radius'], M3_SPRING.fastSpatial),
                    m3Transition(['background-color', 'box-shadow', 'border-color', 'color'], M3_SPRING.fastEffects),
                ].join(', '),
                ...pressMorph(M3_SHAPE.small),
                // Compose's minimum interactive size: a button lower than 48 px takes touches in a 48 px band
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    insetInline: 0,
                    insetBlock: `min(0px, calc((100% - ${M3_LAYOUT.minTouchTarget}px) / 2))`,
                },
                [`&.${buttonClasses.disabled}`]: {
                    color: disabledContent({ theme }),
                },
                variants: [
                    {
                        props: { variant: 'contained' },
                        style: {
                            ...hoverOnly({ boxShadow: M3_ELEVATION.level1 }),
                            [`&.${buttonClasses.disabled}`]: {
                                backgroundColor: disabledContainer({ theme }),
                            },
                        },
                    },
                    {
                        props: { variant: 'contained', color: 'primary' },
                        style: hoverOnly({
                            '--variant-containedBg': applyStateLayer(
                                theme.palette.m3.primary,
                                theme.palette.m3.onPrimary,
                                M3_STATE_LAYER_ALPHA.hover,
                            ),
                        }),
                    },
                    {
                        props: { variant: 'outlined' },
                        style: {
                            padding: `0 ${M3_BUTTON.paddingInline.filled}px`,
                            borderColor: theme.palette.m3.outlineVariant,
                            [`&.${buttonClasses.disabled}`]: {
                                borderColor: disabledContainer({ theme }),
                            },
                        },
                    },
                    { props: { variant: 'text' }, style: { padding: `0 ${M3_BUTTON.paddingInline.text}px` } },
                    {
                        props: ({ ownerState }) => !!ownerState.startIcon && ownerState.variant !== 'text',
                        style: { paddingLeft: M3_BUTTON.paddingInline.withIcon },
                    },
                    {
                        props: { size: 'small' },
                        style: {
                            ...theme.typography.labelMedium,
                            minHeight: M3_BUTTON.height.small,
                            padding: `0 ${M3_BUTTON.paddingInline.small}px`,
                        },
                    },
                    {
                        props: { size: 'large' },
                        style: { minHeight: M3_BUTTON.height.large },
                    },
                ],
            }),
            startIcon: {
                marginLeft: 0,
                marginRight: 8,
                '& > *:nth-of-type(1)': { fontSize: 18 },
            },
            endIcon: {
                marginRight: 0,
                marginLeft: 8,
                '& > *:nth-of-type(1)': { fontSize: 18 },
            },
        },
        variants: [
            {
                props: { variant: 'tonal' },
                style: ({ theme }) => ({
                    backgroundColor: theme.palette.m3.secondaryContainer,
                    color: theme.palette.m3.onSecondaryContainer,
                    ...hoverOnly({
                        backgroundColor: applyStateLayer(
                            theme.palette.m3.secondaryContainer,
                            theme.palette.m3.onSecondaryContainer,
                            M3_STATE_LAYER_ALPHA.hover,
                        ),
                        boxShadow: M3_ELEVATION.level1,
                    }),
                    [`&.${buttonClasses.disabled}`]: {
                        backgroundColor: disabledContainer({ theme }),
                    },
                }),
            },
        ],
    },
    MuiButtonGroup: {
        defaultProps: {
            disableElevation: true,
        },
        styleOverrides: {
            root: {
                gap: CONNECTED_BUTTON_GROUP_GAP,
                borderRadius: M3_SHAPE.full,
            },
            grouped: ({ theme }) => ({
                minWidth: 48,
                borderRadius: M3_SHAPE.small,
                ...pressMorph(M3_SHAPE.extraSmall),
                [`&.${buttonGroupClasses.firstButton}, &.${buttonGroupClasses.lastButton}`]: {
                    borderRadius: M3_SHAPE.small,
                },
                ...connectedButtonGroupOuterCornersSx(
                    `&.${buttonGroupClasses.firstButton}`,
                    `&.${buttonGroupClasses.lastButton}`,
                ),
                [`&.${buttonGroupClasses.firstButton}.${buttonGroupClasses.lastButton}`]: {
                    borderRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
                },
                // the gap replaces MUI's merged borders
                [`&.${buttonGroupClasses.grouped}`]: {
                    borderRightColor: theme.palette.m3.outlineVariant,
                    marginLeft: 0,
                },
            }),
        },
    },
    MuiToggleButtonGroup: {
        styleOverrides: {
            root: {
                gap: CONNECTED_BUTTON_GROUP_GAP,
            },
            // only the shape: the colors come from the toggle buttons, so their disabled state keeps applying
            grouped: {
                borderRadius: M3_SHAPE.small,
                ...pressMorph(M3_SHAPE.extraSmall),
                ...connectedButtonGroupOuterCornersSx(
                    `&.${toggleButtonGroupClasses.firstButton}`,
                    `&.${toggleButtonGroupClasses.lastButton}`,
                ),
                [`&.${toggleButtonGroupClasses.middleButton}, &.${toggleButtonGroupClasses.lastButton}`]: {
                    marginLeft: 0,
                    borderLeft: 0,
                },
                [`&.${toggleButtonClasses.selected}`]: {
                    borderRadius: CONNECTED_BUTTON_GROUP_FULL_RADIUS,
                },
            },
        },
    },
    MuiToggleButton: {
        styleOverrides: {
            // a standalone toggle button is a fully round connected button group item
            root: ({ theme }) => ({
                ...theme.typography.labelLarge,
                minHeight: M3_BUTTON.height.medium,
                padding: `0 ${M3_BUTTON.paddingInline.withIcon}px`,
                ...connectedButtonGroupItemSx(theme),
                borderRadius: M3_SHAPE.full,
                [`&.${toggleButtonClasses.selected}`]: connectedButtonGroupSelectedItemSx(theme),
                [`&.${toggleButtonClasses.disabled}`]: {
                    backgroundColor: disabledContainer({ theme }),
                    color: disabledContent({ theme }),
                },
            }),
        },
    },
    MuiFab: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.labelLarge,
                width: 56,
                height: 56,
                borderRadius: M3_SHAPE.large,
                backgroundColor: theme.palette.m3.primaryContainer,
                color: theme.palette.m3.onPrimaryContainer,
                boxShadow: M3_ELEVATION.level3,
                transition: [
                    m3Transition(['border-radius', 'width'], M3_SPRING.fastSpatial),
                    m3Transition(['background-color', 'box-shadow'], M3_SPRING.fastEffects),
                ].join(', '),
                // MUI's color variants switch to the palette color on hover, also on touch screens after a tap
                '&:hover': {
                    backgroundColor: theme.palette.m3.primaryContainer,
                    '@media (hover: none)': { backgroundColor: theme.palette.m3.primaryContainer },
                },
                ...hoverOnly({
                    backgroundColor: applyStateLayer(
                        theme.palette.m3.primaryContainer,
                        theme.palette.m3.onPrimaryContainer,
                        M3_STATE_LAYER_ALPHA.hover,
                    ),
                    boxShadow: M3_ELEVATION.level4,
                }),
                '&:active': {
                    backgroundColor: applyStateLayer(
                        theme.palette.m3.primaryContainer,
                        theme.palette.m3.onPrimaryContainer,
                        M3_STATE_LAYER_ALPHA.pressed,
                    ),
                    boxShadow: M3_ELEVATION.level3,
                },
                variants: [
                    {
                        props: { size: 'small' },
                        style: { width: 40, height: 40, minHeight: 40, borderRadius: M3_SHAPE.medium },
                    },
                    {
                        props: { variant: 'extended' },
                        style: {
                            ...theme.typography.titleMedium,
                            width: 'auto',
                            minWidth: 80,
                            height: 56,
                            padding: '0 16px',
                            gap: 8,
                            borderRadius: M3_SHAPE.large,
                        },
                    },
                    {
                        props: { variant: 'extended', size: 'small' },
                        style: {
                            ...theme.typography.labelLarge,
                            minWidth: 40,
                            height: 40,
                            padding: '0 12px',
                            borderRadius: M3_SHAPE.medium,
                        },
                    },
                ],
            }),
        },
    },
    MuiCard: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surfaceContainerLow,
                borderRadius: M3_SHAPE.medium,
                boxShadow: 'none',
                variants: [
                    {
                        props: { variant: 'outlined' },
                        style: {
                            backgroundColor: theme.palette.m3.surface,
                            borderColor: theme.palette.m3.outlineVariant,
                        },
                    },
                ],
            }),
        },
    },
    MuiPopover: {
        styleOverrides: {
            paper: ({ theme }) => ({
                [M3_GAP_COLOR_VARIABLE]: theme.palette.m3.surfaceContainer,
                backgroundColor: theme.palette.m3.surfaceContainer,
                borderRadius: M3_SHAPE.extraSmall,
                boxShadow: M3_ELEVATION.level2,
            }),
        },
    },
    MuiMenu: {
        styleOverrides: {
            paper: {
                minWidth: 112,
                maxWidth: 280,
            },
            list: {
                paddingTop: 8,
                paddingBottom: 8,
            },
        },
    },
    MuiMenuItem: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.labelLarge,
                minHeight: 48,
                padding: '0 12px',
                color: theme.palette.m3.onSurface,
                whiteSpace: 'normal',
                [theme.breakpoints.up('sm')]: {
                    minHeight: 48,
                },
                [`& .${listItemIconClasses.root}`]: {
                    minWidth: 36,
                    color: theme.palette.m3.onSurfaceVariant,
                },
                [`& .${listItemTextClasses.primary}`]: {
                    ...theme.typography.labelLarge,
                },
                [`&.${menuItemClasses.selected}`]: {
                    backgroundColor: theme.palette.m3.selected,
                },
                [`&.${menuItemClasses.disabled}`]: {
                    opacity: DISABLED_ALPHA,
                },
            }),
            dense: {
                minHeight: 40,
            },
        },
    },
    MuiAutocomplete: {
        styleOverrides: {
            paper: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surfaceContainer,
                borderRadius: M3_SHAPE.extraSmall,
                boxShadow: M3_ELEVATION.level2,
            }),
            option: {
                minHeight: 48,
            },
        },
    },
    MuiBackdrop: {
        styleOverrides: {
            root: ({ theme }) => ({
                variants: [
                    {
                        props: { invisible: false },
                        style: { backgroundColor: alpha(theme.palette.m3.scrim, SCRIM_ALPHA) },
                    },
                ],
            }),
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: ({ theme }) => ({
                [M3_GAP_COLOR_VARIABLE]: theme.palette.m3.surfaceContainerHigh,
                backgroundColor: theme.palette.m3.surfaceContainerHigh,
                borderRadius: M3_SHAPE.extraLarge,
                boxShadow: 'none',
                margin: 24,
                minWidth: 280,
                maxHeight: 'calc(100% - 48px)',
            }),
            paperWidthSm: {
                maxWidth: 560,
            },
            paperFullWidth: {
                width: 'calc(100% - 48px)',
            },
            paperFullScreen: ({ theme }) => ({
                [M3_GAP_COLOR_VARIABLE]: theme.palette.m3.surface,
                backgroundColor: theme.palette.m3.surface,
                borderRadius: 0,
                margin: 0,
                width: '100%',
                maxHeight: 'none',
            }),
        },
    },
    MuiDialogTitle: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.headlineSmall,
                color: theme.palette.m3.onSurface,
                padding: '24px 24px 16px',
            }),
        },
    },
    MuiDialogContent: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.bodyMedium,
                color: theme.palette.m3.onSurfaceVariant,
                padding: '0 24px',
                variants: [
                    // scrolling content between dividers keeps space to them
                    { props: { dividers: true }, style: { padding: '16px 24px' } },
                ],
            }),
        },
    },
    MuiDialogContentText: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.bodyMedium,
                color: theme.palette.m3.onSurfaceVariant,
            }),
        },
    },
    MuiDialogActions: {
        styleOverrides: {
            root: {
                padding: 24,
                gap: 8,
                flexWrap: 'wrap',
            },
            spacing: {
                '& > :not(style) ~ :not(style)': {
                    marginLeft: 0,
                },
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surfaceContainerLow,
                borderRadius: 0,
                borderColor: theme.palette.m3.outlineVariant,
                variants: [
                    {
                        props: { anchor: 'bottom' },
                        style: {
                            [M3_GAP_COLOR_VARIABLE]: theme.palette.m3.surfaceContainerHigh,
                            backgroundColor: theme.palette.m3.surfaceContainerHigh,
                            borderTopLeftRadius: M3_SHAPE.extraLarge,
                            borderTopRightRadius: M3_SHAPE.extraLarge,
                            paddingBottom: 'env(safe-area-inset-bottom)',
                        },
                    },
                ],
            }),
        },
    },
    MuiTabs: {
        defaultProps: {
            slotProps: {
                indicator: { component: M3TabIndicator },
            },
        },
        styleOverrides: {
            root: ({ theme }) => ({
                minHeight: 48,
                boxShadow: `inset 0 -1px 0 ${theme.palette.m3.outlineVariant}`,
            }),
            // positions M3TabIndicator's bar, which has the color
            indicator: ({ ownerState }) => ({
                backgroundColor: 'transparent',
                transition: m3Transition(['left', 'right', 'top', 'width', 'height'], M3_SPRING.defaultSpatial),
                ...(ownerState.orientation === 'vertical'
                    ? { width: 3 }
                    : { height: 3, display: 'flex', justifyContent: 'center' }),
            }),
        },
    },
    MuiTab: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.titleSmall,
                minHeight: 48,
                padding: '0 16px',
                color: theme.palette.m3.onSurface,
                [`&.${tabClasses.selected}`]: {
                    color: theme.palette.m3.primary,
                },
                [`&.${tabClasses.disabled}`]: {
                    color: disabledContent({ theme }),
                },
            }),
            textColorInherit: {
                opacity: 1,
            },
        },
    },
    MuiList: {
        styleOverrides: {
            padding: {
                paddingTop: 0,
                paddingBottom: 0,
            },
        },
    },
    MuiListItem: {
        styleOverrides: {
            root: {
                minHeight: 56,
            },
            gutters: {
                paddingLeft: 16,
                paddingRight: 16,
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: ({ theme }) => ({
                minHeight: 56,
                [`&.${listItemButtonClasses.selected}`]: {
                    backgroundColor: theme.palette.m3.selected,
                    ...hoverOnly({ backgroundColor: theme.palette.m3.selected }),
                },
            }),
            gutters: {
                paddingLeft: 16,
                paddingRight: 16,
            },
        },
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: ({ theme }) => ({
                minWidth: 48,
                color: theme.palette.m3.primary,
            }),
        },
    },
    MuiListItemAvatar: {
        styleOverrides: {
            root: {
                minWidth: 56,
            },
        },
    },
    MuiListItemText: {
        styleOverrides: {
            primary: ({ theme }) => ({
                ...theme.typography.bodyLarge,
                letterSpacing: 0,
                color: theme.palette.m3.onSurface,
            }),
            secondary: ({ theme }) => ({
                ...theme.typography.bodySmall,
                color: theme.palette.text.secondary,
            }),
        },
    },
    MuiListSubheader: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.bodyMedium,
                color: theme.palette.m3.secondary,
                backgroundColor: 'transparent',
                padding: '14px 16px 8px',
            }),
            sticky: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surface,
            }),
        },
    },
    MuiDivider: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderColor: theme.palette.m3.outlineVariant,
            }),
        },
    },
    MuiSwitch: {
        styleOverrides: {
            root: ({ theme }) => ({
                width: 52,
                height: 48,
                padding: '8px 0',
                overflow: 'visible',
                [`& .${switchClasses.switchBase}`]: {
                    top: 4,
                    left: -4,
                    width: 40,
                    height: 40,
                    padding: 0,
                    transition: [
                        m3Transition(['transform'], M3_SPRING.fastSpatial),
                        m3Transition(['background-color'], M3_SPRING.fastEffects),
                    ].join(', '),
                    ...hoverOnly({ backgroundColor: alpha(theme.palette.m3.onSurface, M3_STATE_LAYER_ALPHA.hover) }),
                },
                // the native input covers exactly the 52 x 48 root (MUI's 300 % wide input would overflow it); more
                // specific than MUI's rule, which can be inserted after these overrides
                [`& .${switchClasses.switchBase} .${switchClasses.input}`]: {
                    top: -4,
                    left: 4,
                    width: 52,
                    height: 48,
                },
                [`& .${switchClasses.switchBase}.${switchClasses.checked} .${switchClasses.input}`]: {
                    left: -16,
                },
                [`& .${switchClasses.switchBase}.${switchClasses.checked}`]: {
                    transform: 'translateX(20px)',
                    ...hoverOnly({ backgroundColor: alpha(theme.palette.m3.primary, M3_STATE_LAYER_ALPHA.hover) }),
                },
                [`& .${switchClasses.thumb}`]: {
                    width: 16,
                    height: 16,
                    boxShadow: 'none',
                    border: 0,
                    backgroundColor: theme.palette.m3.outline,
                    transition: [
                        m3Transition(['width', 'height'], M3_SPRING.fastSpatial),
                        m3Transition(['background-color'], M3_SPRING.fastEffects),
                    ].join(', '),
                },
                [`& .${switchClasses.switchBase}:active .${switchClasses.thumb}`]: {
                    width: 28,
                    height: 28,
                },
                [`& .${switchClasses.checked} .${switchClasses.thumb}`]: {
                    width: 24,
                    height: 24,
                    backgroundColor: theme.palette.m3.onPrimary,
                },
                [`& .${switchClasses.track}`]: {
                    boxSizing: 'border-box',
                    borderRadius: M3_SHAPE.full,
                    border: `2px solid ${theme.palette.m3.outline}`,
                    backgroundColor: theme.palette.m3.surfaceContainerHighest,
                    opacity: 1,
                    transition: m3Transition(['background-color', 'border-color'], M3_SPRING.fastEffects),
                },
                // as specific as MUI's own "checked" track rule (opacity .5), which is inserted later
                [`& .${switchClasses.switchBase}.${switchClasses.checked} + .${switchClasses.track}`]: {
                    borderColor: theme.palette.m3.primary,
                    backgroundColor: theme.palette.m3.primary,
                    opacity: 1,
                },
                [`& .${switchClasses.disabled} .${switchClasses.thumb}`]: {
                    backgroundColor: disabledContent({ theme }),
                },
                [`& .${switchClasses.disabled}.${switchClasses.checked} .${switchClasses.thumb}`]: {
                    backgroundColor: theme.palette.m3.surface,
                },
                [`& .${switchClasses.switchBase}.${switchClasses.disabled} + .${switchClasses.track}`]: {
                    borderColor: disabledContainer({ theme }),
                    backgroundColor: disabledContainer({ theme }),
                    opacity: 1,
                },
                variants: [
                    { props: { edge: 'start' }, style: { marginLeft: 0 } },
                    { props: { edge: 'end' }, style: { marginRight: 0 } },
                ],
            }),
        },
    },
    // unchecked in onSurfaceVariant; MUI's (more specific) checked and disabled colors follow the "color" prop
    MuiCheckbox: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...touchTargetWithStateLayer,
                color: theme.palette.m3.onSurfaceVariant,
            }),
        },
    },
    MuiRadio: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...touchTargetWithStateLayer,
                color: theme.palette.m3.onSurfaceVariant,
            }),
        },
    },
    MuiFormControlLabel: {
        styleOverrides: {
            label: ({ theme }) => ({
                ...theme.typography.bodyLarge,
                letterSpacing: 0,
            }),
        },
    },
    MuiSlider: {
        styleOverrides: {
            root: ({ theme }) => ({
                height: 16,
                padding: '14px 0',
                borderRadius: M3_SHAPE.full,
                '@media (pointer: coarse)': {
                    padding: '14px 0',
                },
                [`&.${sliderClasses.disabled}`]: {
                    color: disabledContent({ theme }),
                },
                variants: [
                    {
                        props: { orientation: 'vertical' },
                        style: {
                            width: 16,
                            height: undefined,
                            padding: '0 14px',
                            '@media (pointer: coarse)': {
                                padding: '0 14px',
                            },
                        },
                    },
                ],
            }),
            rail: ({ theme, ownerState }) => ({
                opacity: 1,
                backgroundColor: theme.palette.m3.secondaryContainer,
                // the stop indicator at the end of the inactive track
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.m3.primary,
                    ...(ownerState.orientation === 'vertical'
                        ? { top: 6, left: '50%', transform: 'translateX(-50%)' }
                        : { right: 6, top: '50%', transform: 'translateY(-50%)' }),
                },
            }),
            track: {
                border: 0,
            },
            thumb: ({ theme, ownerState }) => {
                const ring = `0 0 0 6px ${gapColor({ theme })}`;

                return {
                    width: ownerState.orientation === 'vertical' ? 44 : 4,
                    height: ownerState.orientation === 'vertical' ? 4 : 44,
                    borderRadius: 2,
                    boxShadow: ring,
                    '&::before': {
                        boxShadow: 'none',
                    },
                    [`&:hover, &.${sliderClasses.focusVisible}, &.${sliderClasses.active}`]: {
                        boxShadow: ring,
                    },
                };
            },
            valueLabel: ({ theme }) => ({
                ...theme.typography.labelLarge,
                backgroundColor: theme.palette.m3.inverseSurface,
                color: theme.palette.m3.inverseOnSurface,
                borderRadius: M3_SHAPE.full,
                padding: '4px 12px',
                '&::before': {
                    display: 'none',
                },
            }),
            mark: ({ theme }) => ({
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: theme.palette.m3.onSecondaryContainer,
                opacity: 1,
            }),
            markActive: ({ theme }) => ({
                backgroundColor: theme.palette.m3.onPrimary,
            }),
        },
    },
    MuiInputBase: {
        styleOverrides: {
            // iOS zooms into inputs with a font size below 16 px
            root: ({ theme }) => ({
                ...theme.typography.bodyLarge,
                letterSpacing: 0,
            }),
        },
    },
    MuiInputLabel: {
        styleOverrides: {
            root: ({ theme }) => ({
                color: theme.palette.m3.onSurfaceVariant,
                [`&.${inputLabelClasses.focused}`]: {
                    color: theme.palette.m3.primary,
                },
                [`&.${inputLabelClasses.error}`]: {
                    color: theme.palette.m3.error,
                },
            }),
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: M3_SHAPE.extraSmall,
                [`& .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: theme.palette.m3.outline,
                },
                ...hoverOnly({
                    [`& .${outlinedInputClasses.notchedOutline}`]: {
                        borderColor: theme.palette.m3.onSurface,
                    },
                }),
                [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: theme.palette.m3.primary,
                    borderWidth: 2,
                },
                [`&.${outlinedInputClasses.error} .${outlinedInputClasses.notchedOutline}`]: {
                    borderColor: theme.palette.m3.error,
                },
            }),
        },
    },
    MuiFilledInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surfaceContainerHighest,
                borderTopLeftRadius: M3_SHAPE.extraSmall,
                borderTopRightRadius: M3_SHAPE.extraSmall,
                ...hoverOnly({
                    backgroundColor: applyStateLayer(
                        theme.palette.m3.surfaceContainerHighest,
                        theme.palette.m3.onSurface,
                        M3_STATE_LAYER_ALPHA.hover,
                    ),
                }),
                [`&.${filledInputClasses.focused}`]: {
                    backgroundColor: theme.palette.m3.surfaceContainerHighest,
                },
                '&::before': {
                    borderBottomColor: theme.palette.m3.onSurfaceVariant,
                },
                '&::after': {
                    borderBottomColor: theme.palette.m3.primary,
                },
            }),
        },
    },
    MuiInput: {
        styleOverrides: {
            root: ({ theme }) => ({
                '&::before': {
                    borderBottomColor: theme.palette.m3.onSurfaceVariant,
                },
                '&::after': {
                    borderBottomColor: theme.palette.m3.primary,
                },
                [`&.${inputClasses.error}::after`]: {
                    borderBottomColor: theme.palette.m3.error,
                },
            }),
        },
    },
    MuiChip: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.labelLarge,
                height: 32,
                borderRadius: M3_SHAPE.small,
                [`& .${chipClasses.label}`]: {
                    paddingLeft: 16,
                    paddingRight: 16,
                },
                [`& .${chipClasses.icon}`]: {
                    fontSize: 18,
                    marginLeft: 8,
                    marginRight: 0,
                },
                [`& .${chipClasses.icon} + .${chipClasses.label}, & .${chipClasses.avatar} + .${chipClasses.label}`]: {
                    paddingLeft: 8,
                },
                [`& .${chipClasses.label}:has(+ .${chipClasses.deleteIcon})`]: {
                    paddingRight: 8,
                },
                [`& .${chipClasses.deleteIcon}`]: {
                    fontSize: 18,
                    margin: '0 8px 0 0',
                },
                variants: [
                    {
                        props: { variant: 'filled', color: 'default' },
                        style: {
                            backgroundColor: theme.palette.m3.secondaryContainer,
                            color: theme.palette.m3.onSecondaryContainer,
                            [`& .${chipClasses.icon}`]: {
                                color: theme.palette.m3.onSecondaryContainer,
                            },
                        },
                    },
                    {
                        props: { variant: 'outlined' },
                        style: {
                            borderColor: theme.palette.m3.outlineVariant,
                        },
                    },
                    {
                        props: { variant: 'outlined', color: 'default' },
                        style: {
                            color: theme.palette.m3.onSurfaceVariant,
                            [`& .${chipClasses.icon}`]: {
                                color: theme.palette.m3.primary,
                            },
                        },
                    },
                    {
                        // the M3 state layer replaces MUI's hover and focus tints, which stay on touch screens after a
                        // tap (e.g. after a sheet opened by the chip is closed), and its press shadow
                        props: { clickable: true },
                        style: {
                            ...m3StateLayerSx(),
                            '&:active': { boxShadow: 'none' },
                        },
                    },
                    {
                        props: { clickable: true, variant: 'filled', color: 'default' },
                        style: {
                            [`&:hover, &.${chipClasses.focusVisible}`]: {
                                backgroundColor: theme.palette.m3.secondaryContainer,
                            },
                        },
                    },
                    {
                        props: { clickable: true, variant: 'outlined' },
                        style: {
                            [`&.${chipClasses.clickable}:hover, &.${chipClasses.focusVisible}`]: {
                                backgroundColor: 'transparent',
                            },
                        },
                    },
                    {
                        props: { size: 'small' },
                        style: {
                            ...theme.typography.labelMedium,
                            height: 24,
                            borderRadius: M3_SHAPE.small,
                            [`& .${chipClasses.label}`]: {
                                paddingLeft: 8,
                                paddingRight: 8,
                            },
                            [`& .${chipClasses.icon}`]: {
                                fontSize: 16,
                                marginLeft: 4,
                            },
                            [`& .${chipClasses.icon} + .${chipClasses.label}`]: {
                                paddingLeft: 4,
                            },
                        },
                    },
                ],
            }),
        },
    },
    MuiBadge: {
        styleOverrides: {
            badge: ({ theme }) => ({
                ...theme.typography.labelSmall,
                height: 16,
                minWidth: 16,
                padding: '0 4px',
                borderRadius: M3_SHAPE.full,
            }),
            dot: {
                height: 6,
                minWidth: 6,
                padding: 0,
            },
        },
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: ({ theme }) => ({
                ...theme.typography.bodySmall,
                backgroundColor: theme.palette.m3.inverseSurface,
                color: theme.palette.m3.inverseOnSurface,
                borderRadius: M3_SHAPE.extraSmall,
                minHeight: 24,
                padding: '4px 8px',
            }),
            arrow: ({ theme }) => ({
                color: theme.palette.m3.inverseSurface,
            }),
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: ({ theme }) => ({
                height: 4,
                borderRadius: M3_SHAPE.full,
                backgroundColor: theme.palette.m3.secondaryContainer,
                variants: [
                    {
                        props: { variant: 'determinate' },
                        style: {
                            // the stop indicator at the end of the track
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                insetInlineEnd: 0,
                                top: 0,
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.m3.primary,
                            },
                        },
                    },
                ],
            }),
            bar: ({ theme }) => ({
                borderRadius: M3_SHAPE.full,
                backgroundColor: theme.palette.m3.primary,
                // the gap between the indicator and the track
                boxShadow: `0 0 0 4px ${gapColor({ theme })}`,
            }),
            dashed: {
                display: 'none',
            },
        },
    },
    MuiCircularProgress: {
        defaultProps: {
            thickness: 4.4,
        },
        styleOverrides: {
            circle: {
                strokeLinecap: 'round',
            },
            track: ({ theme }) => ({
                stroke: theme.palette.m3.secondaryContainer,
                opacity: 1,
            }),
            colorPrimary: ({ theme }) => ({
                [`& .${circularProgressClasses.circle}`]: {
                    stroke: theme.palette.m3.primary,
                },
            }),
        },
    },
    MuiSkeleton: {
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surfaceContainerHigh,
            }),
            rounded: {
                borderRadius: M3_SHAPE.medium,
            },
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: ({ theme }) => ({
                ...theme.typography.bodyMedium,
                borderRadius: M3_SHAPE.medium,
                backgroundColor: theme.palette.m3.surfaceContainerHigh,
                color: theme.palette.m3.onSurface,
                variants: [
                    {
                        props: { severity: 'error' },
                        style: { [`& .${alertClasses.icon}`]: { color: theme.palette.m3.error } },
                    },
                    {
                        props: { severity: 'warning' },
                        style: { [`& .${alertClasses.icon}`]: { color: theme.palette.m3.active } },
                    },
                    {
                        props: { severity: 'info' },
                        style: { [`& .${alertClasses.icon}`]: { color: theme.palette.m3.primary } },
                    },
                    {
                        props: { severity: 'success' },
                        style: { [`& .${alertClasses.icon}`]: { color: theme.palette.m3.tertiary } },
                    },
                ],
            }),
        },
    },
    MuiAccordion: {
        defaultProps: {
            disableGutters: true,
            elevation: 0,
            square: true,
        },
        styleOverrides: {
            root: ({ theme }) => ({
                backgroundColor: theme.palette.m3.surface,
                boxShadow: 'none',
                '&::before': {
                    backgroundColor: theme.palette.m3.outlineVariant,
                },
                [`&.${accordionClasses.expanded}::before`]: {
                    opacity: 1,
                },
            }),
        },
    },
});
