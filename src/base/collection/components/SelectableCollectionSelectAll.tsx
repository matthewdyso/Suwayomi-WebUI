/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import DeselectRoundedIcon from '@mui/icons-material/DeselectRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

/**
 * Mihon's "select all" action of a selection toolbar; once everything is selected it clears the selection instead.
 */
export const SelectableCollectionSelectAll = ({
    areAllItemsSelected,
    onChange,
}: {
    areAllItemsSelected: boolean;
    onChange: (checked: boolean) => void;
}) => {
    const { t } = useLingui();
    const title = areAllItemsSelected ? t`Clear` : t`Select all`;

    return (
        <CustomTooltip title={title}>
            <IconButton aria-label={title} color="inherit" onClick={() => onChange(!areAllItemsSelected)}>
                {areAllItemsSelected ? <DeselectRoundedIcon /> : <SelectAllRoundedIcon />}
            </IconButton>
        </CustomTooltip>
    );
};
