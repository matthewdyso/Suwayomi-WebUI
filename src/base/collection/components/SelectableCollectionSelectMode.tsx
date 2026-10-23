/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { SelectableCollectionSelectAll } from '@/base/collection/components/SelectableCollectionSelectAll.tsx';

/**
 * The app bar action of a selection: select all while selecting, otherwise (if the selection can be cancelled) starting
 * the selection. A cancelable selection shows Mihon's action-mode toolbar instead (see "useAppBarActionMode").
 */
export const SelectableCollectionSelectMode = ({
    isActive,
    areAllItemsSelected,
    onSelectAll,
    onModeChange,
    isCancelable = true,
}: {
    isActive: boolean;
    areAllItemsSelected: boolean;
    onSelectAll: (selectAll: boolean) => void;
    onModeChange: (checked: boolean) => void;
    isCancelable?: boolean;
}) => {
    const { t } = useLingui();

    if (isActive) {
        return <SelectableCollectionSelectAll areAllItemsSelected={areAllItemsSelected} onChange={onSelectAll} />;
    }

    if (!isCancelable) {
        return null;
    }

    return (
        <CustomTooltip title={t`Select all`}>
            <IconButton aria-label={t`Select all`} color="inherit" onClick={() => onModeChange(true)}>
                <SelectAllRoundedIcon />
            </IconButton>
        </CustomTooltip>
    );
};
