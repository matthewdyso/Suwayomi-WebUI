/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import Divider from '@mui/material/Divider';
import { Metadata } from '@/base/components/texts/Metadata.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

/**
 * Mihon's "InfoText": a value over its label, centered, with a short divider to the next one.
 */
export const ExtensionMetadata = ({
    addDivider = true,
    ...props
}: ComponentProps<typeof Metadata> & { addDivider?: boolean }) => (
    <>
        <Metadata
            {...props}
            stackProps={{
                ...props.stackProps,
                sx: MUIUtil.mergeSx(
                    {
                        flexDirection: 'column-reverse',
                        alignItems: 'center',
                        textAlign: 'center',
                        flexGrow: 1,
                        flexBasis: 0,
                    },
                    props.stackProps?.sx,
                ),
            }}
            titleProps={{
                variant: 'bodySmall',
                ...props.titleProps,
                sx: MUIUtil.mergeSx({ color: 'text.secondary' }, props.titleProps?.sx),
            }}
            valueProps={{
                variant: 'titleMedium',
                ...props.valueProps,
            }}
        />
        {addDivider && <Divider orientation="vertical" sx={{ height: 24, mx: 1 }} />}
    </>
);
