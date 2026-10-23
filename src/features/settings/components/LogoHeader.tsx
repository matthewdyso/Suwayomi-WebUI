/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { SuwayomiLogo } from '@/assets/SuwayomiLogo.tsx';

/**
 * Mihon's `LogoHeader`: the app logo, 64 px and centered, above a full-width divider.
 */
export const LogoHeader = ({ paddingY }: { paddingY: number }) => {
    const theme = useTheme();

    return (
        <Stack sx={{ alignItems: 'center' }}>
            {/* the app's name, not translated */}
            <SuwayomiLogo
                titleAccess="Suwayomi"
                circleRingColor={theme.palette.m3.primary}
                sx={{ fontSize: 64, my: `${paddingY}px` }}
            />
            <Divider flexItem />
        </Stack>
    );
};
