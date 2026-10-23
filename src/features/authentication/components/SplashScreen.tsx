/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTheme } from '@mui/material/styles';
import type { StackProps } from '@mui/material/Stack';
import Stack from '@mui/material/Stack';
import type { ComponentProps } from 'react';
import { SuwayomiLogo } from '@/assets/SuwayomiLogo.tsx';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { WavyCircularProgress } from '@/base/components/feedback/WavyProgress.tsx';

export const SplashScreen = ({
    slots,
}: {
    slots?: {
        stackProps?: StackProps;
        logoProps?: ComponentProps<typeof SuwayomiLogo>;
        serverAddressProps?: StackProps;
    };
}) => {
    const theme = useTheme();

    return (
        <Stack
            {...slots?.stackProps}
            sx={MUIUtil.mergeSx(
                {
                    position: 'relative',
                    minWidth: '100vw',
                    minHeight: '100vh',
                    '@supports (min-height: 100dvh)': {
                        minHeight: '100dvh',
                    },
                    gap: 4,
                    justifyContent: 'center',
                    alignItems: 'center',
                    pt: 'env(safe-area-inset-top)',
                    pb: 'env(safe-area-inset-bottom)',
                    bgcolor: 'm3.surface',
                },
                slots?.stackProps?.sx,
            )}
        >
            <SuwayomiLogo
                circleRingColor={theme.palette.m3.primary}
                {...slots?.logoProps}
                sx={MUIUtil.mergeSx({ fontSize: 160 }, slots?.logoProps?.sx)}
            />
            <WavyCircularProgress />
            <Stack
                {...slots?.serverAddressProps}
                sx={MUIUtil.mergeSx(
                    {
                        position: 'absolute',
                        left: 'env(safe-area-inset-left)',
                        bottom: 'env(safe-area-inset-bottom)',
                    },
                    slots?.serverAddressProps?.sx,
                )}
            >
                <ServerAddressSetting />
            </Stack>
        </Stack>
    );
};
