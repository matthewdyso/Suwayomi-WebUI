/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Mihon's `InfoWidget`: a note between preference rows, an info icon above small text.
 *
 * Mihon dims the whole widget to its secondary alpha; here only the text color is dimmed (`text.secondary`), so links
 * in the note keep their full primary color.
 */
export const InfoPreference = ({
    children,
    icon = <InfoOutlinedIcon />,
}: {
    children: ReactNode;
    icon?: ReactNode;
}) => (
    <Stack sx={{ px: 2, py: 2, gap: 2, color: 'text.secondary' }}>
        {icon}
        <Typography variant="bodySmall" component="div">
            {children}
        </Typography>
    </Stack>
);
