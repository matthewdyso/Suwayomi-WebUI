/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useElementSize } from '@mantine/hooks';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

/**
 * Material 3 Expressive wavy progress indicators (circular and linear), drawn as SVG.
 *
 * - "value" (0-100) makes them determinate, without it they are indeterminate
 * - the indicator is drawn in "currentColor" (primary by default), the track in secondaryContainer, or, with
 *   "trackAlpha", in the indicator color at that alpha
 * - the wave flattens to a line at 0 and 100 and when the user prefers reduced motion
 */
export type WavyProgressProps = {
    value?: number;
    size?: number;
    strokeWidth?: number;
    wavelength?: number;
    amplitude?: number;
    trackAlpha?: number;
    /**
     * Gap between the indicator and the track.
     */
    gap?: number;
    'aria-label'?: string;
    sx?: SxProps<Theme>;
};

/**
 * A circular indicator in place of a 24 px icon (e.g. an app bar action), thinner and with a finer wave than the
 * default ring so it reads at icon size.
 */
export const WAVY_ICON_PROGRESS_PROPS = {
    size: 24,
    strokeWidth: 2,
    wavelength: 7,
    amplitude: 0.6,
} satisfies Partial<WavyProgressProps>;

const PATH_LENGTH = 100;

const circularRotation = keyframes`
    to {
        transform: rotate(360deg);
    }
`;

// MUI's indeterminate circular dash, scaled to a path length of 100
const circularDash = keyframes`
    0% {
        stroke-dasharray: 1 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 70 200;
        stroke-dashoffset: -15;
    }
    100% {
        stroke-dasharray: 1 200;
        stroke-dashoffset: -99;
    }
`;

const linearIndeterminate = keyframes`
    from {
        stroke-dashoffset: 40;
    }
    to {
        stroke-dashoffset: -100;
    }
`;

const round = (value: number): number => Math.round(value * 100) / 100;

const clampProgress = (value: number): number => Math.min(PATH_LENGTH, Math.max(0, value));

const useEffectiveAmplitude = (amplitude: number, value: number | undefined): number => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const isFlat = prefersReducedMotion || (value !== undefined && (value <= 0 || value >= PATH_LENGTH));

    return isFlat ? 0 : amplitude;
};

/**
 * A closed circle, starting at 12 o'clock and running clockwise, whose radius oscillates with a whole number of waves.
 */
const createWavyCirclePath = (center: number, radius: number, amplitude: number, wavelength: number): string => {
    const waveCount = Math.max(1, Math.round((2 * Math.PI * radius) / wavelength));
    const steps = waveCount * 16;

    const points = Array.from({ length: steps }, (_, step) => {
        const progress = step / steps;
        const angle = -Math.PI / 2 + progress * 2 * Math.PI;
        const pointRadius = radius + amplitude * Math.sin(progress * waveCount * 2 * Math.PI);

        return `${round(center + pointRadius * Math.cos(angle))} ${round(center + pointRadius * Math.sin(angle))}`;
    });

    return `M${points[0]}L${points.slice(1).join(' ')}Z`;
};

const createWavyLinePath = (
    startX: number,
    endX: number,
    centerY: number,
    amplitude: number,
    wavelength: number,
): string => {
    const stepWidth = wavelength / 16;
    const stepCount = Math.max(1, Math.ceil((endX - startX) / stepWidth));

    const points = Array.from({ length: stepCount + 1 }, (_, step) => {
        const x = Math.min(endX, startX + step * stepWidth);
        const y = centerY + amplitude * Math.sin(((x - startX) / wavelength) * 2 * Math.PI);

        return `${round(x)} ${round(y)}`;
    });

    return `M${points[0]}L${points.slice(1).join(' ')}`;
};

const createTrackSx = (trackAlpha: number | undefined): SxProps<Theme> =>
    trackAlpha === undefined
        ? { stroke: (theme) => theme.palette.m3.secondaryContainer }
        : { stroke: 'currentColor', strokeOpacity: trackAlpha };

const rootSx = (sx: SxProps<Theme> | undefined): SxProps<Theme> =>
    MUIUtil.mergeSx({ display: 'inline-block', flexShrink: 0, color: 'm3.primary' }, sx);

export const WavyCircularProgress = ({
    value,
    size = 44,
    strokeWidth = 4,
    wavelength = 15,
    amplitude = 1.6,
    trackAlpha,
    gap = 4,
    'aria-label': ariaLabel,
    sx,
}: WavyProgressProps) => {
    const isDeterminate = value !== undefined;
    const progress = clampProgress(value ?? 0);
    const effectiveAmplitude = useEffectiveAmplitude(amplitude, value);

    const center = size / 2;
    const radius = center - strokeWidth / 2 - amplitude;

    const indicatorPath = useMemo(
        () => createWavyCirclePath(center, radius, effectiveAmplitude, wavelength),
        [center, radius, effectiveAmplitude, wavelength],
    );
    const trackPath = useMemo(() => createWavyCirclePath(center, radius, 0, wavelength), [center, radius, wavelength]);

    // the round caps reach half a stroke past each end of a dash
    const gapLength = ((gap + strokeWidth) / (2 * Math.PI * radius)) * PATH_LENGTH;
    const trackStart = progress + gapLength;
    const trackLength = PATH_LENGTH - progress - 2 * gapLength;

    return (
        <Box
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuenow={isDeterminate ? Math.round(progress) : undefined}
            aria-valuemin={isDeterminate ? 0 : undefined}
            aria-valuemax={isDeterminate ? PATH_LENGTH : undefined}
            sx={MUIUtil.mergeSx(rootSx(sx), { width: size, height: size })}
        >
            <Box
                component="svg"
                viewBox={`0 0 ${size} ${size}`}
                sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    animation: isDeterminate ? undefined : `${circularRotation} 1.4s linear infinite`,
                }}
            >
                {isDeterminate && trackLength > 0 && (
                    <Box
                        component="path"
                        d={trackPath}
                        pathLength={PATH_LENGTH}
                        fill="none"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${round(trackLength)} ${PATH_LENGTH}`}
                        strokeDashoffset={round(-trackStart)}
                        sx={createTrackSx(trackAlpha)}
                    />
                )}
                {(!isDeterminate || progress > 0) && (
                    <Box
                        component="path"
                        d={indicatorPath}
                        pathLength={PATH_LENGTH}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={isDeterminate ? `${round(progress)} ${PATH_LENGTH}` : undefined}
                        sx={{
                            animation: isDeterminate ? undefined : `${circularDash} 1.4s ease-in-out infinite`,
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};

export const WavyLinearProgress = ({
    value,
    size = 10,
    strokeWidth = 4,
    wavelength,
    amplitude = 3,
    trackAlpha,
    gap = 4,
    'aria-label': ariaLabel,
    sx,
}: WavyProgressProps) => {
    const { ref, width } = useElementSize<HTMLDivElement>();

    const isDeterminate = value !== undefined;
    const progress = clampProgress(value ?? 0);
    const effectiveAmplitude = useEffectiveAmplitude(amplitude, value);
    const finalWavelength = wavelength ?? (isDeterminate ? 40 : 20);

    const centerY = size / 2;
    const capOffset = strokeWidth / 2;
    const stopDotRadius = 2;
    const indicatorEnd = Math.max(capOffset, (width * progress) / PATH_LENGTH - capOffset);
    // without an indicator (nothing done yet) the track starts where the indicator would
    const trackStart = isDeterminate && progress > 0 ? indicatorEnd + strokeWidth + gap : capOffset;
    const trackEnd = width - capOffset;

    const indicatorPath = useMemo(
        () =>
            createWavyLinePath(
                capOffset,
                isDeterminate ? indicatorEnd : trackEnd,
                centerY,
                effectiveAmplitude,
                finalWavelength,
            ),
        [capOffset, isDeterminate, indicatorEnd, trackEnd, centerY, effectiveAmplitude, finalWavelength],
    );

    return (
        <Box
            ref={ref}
            role="progressbar"
            aria-label={ariaLabel}
            aria-valuenow={isDeterminate ? Math.round(progress) : undefined}
            aria-valuemin={isDeterminate ? 0 : undefined}
            aria-valuemax={isDeterminate ? PATH_LENGTH : undefined}
            sx={MUIUtil.mergeSx(rootSx(sx), { display: 'block', width: '100%', height: size })}
        >
            {width > 0 && (
                <svg width={width} height={size} viewBox={`0 0 ${width} ${size}`} display="block">
                    {trackStart < trackEnd && (
                        <Box
                            component="path"
                            d={`M${round(trackStart)} ${centerY}L${round(trackEnd)} ${centerY}`}
                            fill="none"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            sx={createTrackSx(trackAlpha)}
                        />
                    )}
                    {isDeterminate && progress < PATH_LENGTH && (
                        <circle cx={width - stopDotRadius} cy={centerY} r={stopDotRadius} fill="currentColor" />
                    )}
                    {(!isDeterminate || progress > 0) && (
                        <Box
                            component="path"
                            d={indicatorPath}
                            pathLength={isDeterminate ? undefined : PATH_LENGTH}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={isDeterminate ? undefined : `40 ${PATH_LENGTH * 2}`}
                            sx={{
                                animation: isDeterminate
                                    ? undefined
                                    : `${linearIndeterminate} 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite`,
                            }}
                        />
                    )}
                </svg>
            )}
        </Box>
    );
};
