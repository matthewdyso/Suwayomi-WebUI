/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { plural } from '@lingui/core/macro';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';

/**
 * Mihon's "MissingChapterCountListItem" between two chapters with a gap in their numbers.
 */
export const MissingChaptersInfoSeparator = ({
    missingChaptersGap: missingChapterCount,
}: {
    missingChaptersGap: number;
}) => (
    <Stack
        sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1,
            opacity: SECONDARY_ALPHA,
        }}
    >
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="labelMedium" component="span">
            {plural(missingChapterCount, {
                one: 'Missing # chapter',
                other: 'Missing # chapters',
            })}
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
    </Stack>
);
