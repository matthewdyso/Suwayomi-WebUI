/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import type { ReaderSettingsTypeProps } from '@/features/reader/Reader.types.ts';
import { ReaderSettingHotkey } from '@/features/reader/hotkeys/settings/components/ReaderSettingHotkey.tsx';
import { READER_HOTKEYS } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ResetButton } from '@/base/components/buttons/ResetButton.tsx';
import { ReaderSettingRow } from '@/features/reader/settings/components/ReaderSettingRow.tsx';

export const ReaderHotkeysSettings = ({ settings, updateSetting, onDefault }: ReaderSettingsTypeProps) => {
    const { t } = useLingui();

    return (
        <Stack>
            <ReaderSettingRow sx={{ textAlign: 'end' }}>
                <Typography variant="bodySmall" sx={{ color: 'text.secondary' }}>
                    {t`Click key to remove binding`}
                </Typography>
            </ReaderSettingRow>
            {READER_HOTKEYS.map((hotkey) => (
                <ReaderSettingHotkey
                    key={hotkey}
                    hotkey={hotkey}
                    keys={settings.hotkeys[hotkey]}
                    existingKeys={Object.values(settings.hotkeys).flat()}
                    updateSetting={(keys) => updateSetting('hotkeys', { ...settings.hotkeys, [hotkey]: keys })}
                />
            ))}
            <ReaderSettingRow sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ResetButton onClick={() => onDefault?.('hotkeys')} variant="outlined" />
            </ReaderSettingRow>
        </Stack>
    );
};
