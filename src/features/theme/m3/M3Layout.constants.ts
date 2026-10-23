/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Sizes in px, without safe-area insets.
 */
export const M3_LAYOUT = {
    topAppBarHeight: 64,
    navigationBarHeight: 80,
    navigationRailWidth: 80,
    minTouchTarget: 48,
    screenPadding: 16,
} as const;

/**
 * M3 button sizes in px (the theme's Button override): heights per size, inline paddings per variant.
 */
export const M3_BUTTON = {
    height: { small: 32, medium: 40, large: 48 },
    paddingInline: { filled: 24, text: 12, small: 12, withIcon: 16 },
} as const;

export const SCROLLBAR_SIZE = 14;

/**
 * CSS custom properties the app shell and the theme provide.
 */
export const M3_CSS_VARIABLE = {
    /**
     * Height of the top app bar, including the top safe-area inset (set on :root by the app shell).
     */
    appBarHeight: '--app-bar-height',
    /**
     * Height of the bottom navigation bar, including the bottom safe-area inset, 0px while it's hidden (set on :root
     * by the app shell).
     */
    bottomBarHeight: '--app-bottom-bar-height',
    /**
     * The color behind sliders and progress indicators, used to draw their gaps. Containers with a background other
     * than "surface" set it (dialogs, sheets and menus do so through the theme).
     */
    sliderGapColor: '--m3-slider-gap-color',
    /**
     * Multiplies the duration of the spring transitions: 0 while the system asks for reduced motion (set on :root by
     * the theme), so movement becomes instant.
     */
    motionScale: '--m3-motion-scale',
    /**
     * Opacity of the light themes' status bar scrim, 1 unless a screen sets it: the reader sets 0 while its overlay
     * is hidden, so pages draw under the status bar without a band.
     */
    statusBarScrimOpacity: '--m3-status-bar-scrim-opacity',
} as const;
