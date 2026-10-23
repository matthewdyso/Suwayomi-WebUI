/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import type { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { CheckboxItem } from '@/base/components/settings/SheetRows.tsx';

export const ReaderSettingInvert = ({
    invert,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'invert'> & {
    updateSetting: (invert: boolean) => void;
}) => {
    const { t } = useLingui();

    return (
        <Stack>
            <CheckboxItem label={t`Invert`} checked={invert} onChange={(_, checked) => updateSetting(checked)} />
        </Stack>
    );
};
