/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterListRounded from '@mui/icons-material/FilterListRounded';
import IconButton from '@mui/material/IconButton';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { LibraryOptionsPanel } from '@/features/library/components/LibraryOptionsPanel.tsx';
import { getCategoryMetadata } from '@/features/category/services/CategoryMetadata.ts';

/**
 * Mihon's library filter action: tinted with the "active" color while any filter is set, opens the options sheet.
 */
export const LibraryToolbarMenu = ({
    category,
}: {
    category: ComponentProps<typeof LibraryOptionsPanel>['category'];
}) => {
    const { t } = useLingui();

    const [open, setOpen] = useState(false);
    const options = getCategoryMetadata(category);

    const isStatusFilterActive = Object.values(options.hasStatus).some((hasStatus) => hasStatus != null);
    const isTrackerFilterActive = Object.values(options.hasTrackerBinding.filters).some(
        (trackerFilterStatus) => trackerFilterStatus != null,
    );
    const isSourceFilterActive = Object.values(options.hasSource).some(
        (sourceFilterStatus) => sourceFilterStatus != null,
    );
    const active =
        options.hasDownloadedChapters != null ||
        options.hasUnreadChapters != null ||
        options.hasReadChapters != null ||
        options.hasBookmarkedChapters != null ||
        options.hasDuplicateChapters != null ||
        isSourceFilterActive ||
        isTrackerFilterActive ||
        isStatusFilterActive;

    return (
        <>
            <CustomTooltip title={t`Filter`}>
                <IconButton onClick={() => setOpen(!open)} sx={{ color: active ? 'm3.active' : 'inherit' }}>
                    <FilterListRounded />
                </IconButton>
            </CustomTooltip>
            <LibraryOptionsPanel
                category={category}
                open={open}
                onClose={() => setOpen(false)}
                active={active}
                isStatusFilterActive={isStatusFilterActive}
                isTrackerFilterActive={isTrackerFilterActive}
                isSourceFilterActive={isSourceFilterActive}
            />
        </>
    );
};
