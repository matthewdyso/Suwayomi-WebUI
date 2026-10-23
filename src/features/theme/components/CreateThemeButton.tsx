/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { AwaitableComponent } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { ThemeCreationDialog } from '@/features/theme/components/CreateThemeDialog.tsx';
import { ThemePreviewTile } from '@/features/theme/components/ThemePreview.tsx';

export const CreateThemeButton = () => {
    const { t } = useLingui();

    return (
        <ThemePreviewTile
            label={t`Create theme`}
            isSelected={false}
            onClick={() => {
                AwaitableComponent.show(ThemeCreationDialog, { mode: 'create' });
            }}
        >
            <Stack
                sx={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'm3.surfaceContainerHigh',
                    color: 'm3.primary',
                }}
            >
                <AddRoundedIcon fontSize="large" />
            </Stack>
        </ThemePreviewTile>
    );
};
