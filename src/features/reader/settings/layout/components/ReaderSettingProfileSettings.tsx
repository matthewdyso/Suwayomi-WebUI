/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import { HeadingItem } from '@/base/components/settings/SheetRows.tsx';
import { ReaderLayoutSettings } from '@/features/reader/settings/layout/ReaderLayoutSettings.tsx';
import { useDefaultReaderSettingsWithDefaultFlag } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import type { ReadingMode } from '@/features/reader/Reader.types.ts';

export const ReaderSettingProfileSettings = ({
    profile,
    title,
    updateSetting,
    isSeriesMode,
    ...props
}: Pick<ComponentProps<typeof ReaderLayoutSettings>, 'updateSetting' | 'isSeriesMode'> & {
    profile: ReadingMode;
    title: string;
}) => {
    const { settings } = useDefaultReaderSettingsWithDefaultFlag(profile);

    const adjustedSettings = useMemo(
        () => ({
            ...settings,
            readingMode: {
                value: profile,
                isDefault: true,
            },
        }),
        [settings, profile],
    );

    return (
        <Stack>
            {!isSeriesMode ? (
                // indented like the setting rows below it (Mihon's sheet rows: 24 px)
                <ListSubheader component="div" id={`${profile}-settings`} sx={{ px: 3 }}>
                    {title}
                </ListSubheader>
            ) : (
                <HeadingItem>{title}</HeadingItem>
            )}
            <ReaderLayoutSettings
                {...props}
                settings={adjustedSettings}
                updateSetting={(setting, value, commit) => updateSetting(setting, value, commit, true, profile)}
            />
        </Stack>
    );
};
