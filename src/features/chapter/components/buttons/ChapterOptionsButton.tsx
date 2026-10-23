/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

/**
 * Opens the chapter filter, sort and display options; tinted while a filter hides chapters (Mihon).
 */
export const ChapterOptionsButton = ({ isFiltered, onClick }: { isFiltered: boolean; onClick: () => void }) => {
    const { t } = useLingui();

    return (
        <CustomTooltip title={t`Filter and sort`}>
            <IconButton
                aria-label={t`Filter and sort`}
                onClick={onClick}
                sx={{ color: isFiltered ? 'm3.active' : 'inherit' }}
            >
                <FilterListRoundedIcon />
            </IconButton>
        </CustomTooltip>
    );
};
