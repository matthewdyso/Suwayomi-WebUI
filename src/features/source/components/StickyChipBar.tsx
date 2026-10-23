/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { OffsetComponent } from '@/base/OffsetComponent.tsx';
import { ChipRow } from '@/base/components/chips/ChipRow.tsx';

/**
 * Mihon's filter chip bar of source browse and global search, pinned below the app bar with a divider underneath.
 * Screens showing it keep the app bar flat (useFlatAppBar), so bar and chips stay one surface.
 */
export const StickyChipBar = ({ children }: { children: ReactNode }) => (
    <OffsetComponent>
        <Box sx={{ bgcolor: 'm3.surface' }}>
            <ChipRow sx={{ py: 1 }}>{children}</ChipRow>
            <Divider />
        </Box>
    </OffsetComponent>
);
