/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { M3Spring } from '@/features/theme/m3/M3.types.ts';

export const M3_EASING = {
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
    standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
} as const;

/**
 * Durations in ms.
 */
export const M3_DURATION = {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
    extraLong1: 700,
    extraLong2: 800,
    extraLong3: 900,
    extraLong4: 1000,
} as const;

// The expressive motion scheme's springs, sampled from the spring equations (25 samples) into CSS "linear()" curves.
// Engines without "linear()" (Safari < 17.2) drop the declaration and the change is instant.
const FAST_SPATIAL_CURVE =
    'linear(0, 0.071, 0.235, 0.435, 0.631, 0.8, 0.929, 1.017, 1.069, 1.092, 1.094, 1.083, 1.065, 1.046, 1.028, 1.014, 1.003, 0.996, 0.992, 0.991, 0.991, 0.993, 0.995, 0.996, 1)';
const SPATIAL_CURVE =
    'linear(0, 0.047, 0.155, 0.291, 0.432, 0.563, 0.677, 0.771, 0.846, 0.903, 0.945, 0.974, 0.994, 1.005, 1.012, 1.015, 1.015, 1.014, 1.012, 1.01, 1.008, 1.006, 1.004, 1.003, 1)';
const EFFECTS_CURVE =
    'linear(0, 0.049, 0.157, 0.284, 0.41, 0.525, 0.623, 0.705, 0.771, 0.824, 0.866, 0.898, 0.923, 0.942, 0.957, 0.968, 0.976, 0.982, 0.987, 0.99, 0.993, 0.995, 0.996, 0.997, 1)';

/**
 * Spatial springs animate position, size, shape and scale ("transform", "border-radius");
 * effects springs animate opacity and colors.
 */
export const M3_SPRING = {
    fastSpatial: { easing: FAST_SPATIAL_CURVE, duration: 347 },
    defaultSpatial: { easing: SPATIAL_CURVE, duration: 411 },
    slowSpatial: { easing: SPATIAL_CURVE, duration: 567 },
    fastEffects: { easing: EFFECTS_CURVE, duration: 137 },
    defaultEffects: { easing: EFFECTS_CURVE, duration: 211 },
    slowEffects: { easing: EFFECTS_CURVE, duration: 299 },
} as const satisfies Record<string, M3Spring>;

/**
 * MUI's transition tokens mapped onto M3 easings and durations.
 */
export const M3_MUI_TRANSITIONS = {
    easing: {
        easeInOut: M3_EASING.standard,
        easeOut: M3_EASING.emphasizedDecelerate,
        easeIn: M3_EASING.emphasizedAccelerate,
        sharp: M3_EASING.standardAccelerate,
    },
    duration: {
        shortest: M3_DURATION.short2,
        shorter: M3_DURATION.short3,
        short: M3_DURATION.short4,
        standard: M3_DURATION.medium2,
        complex: M3_DURATION.medium4,
        enteringScreen: M3_DURATION.medium4,
        leavingScreen: M3_DURATION.short4,
    },
} as const;
