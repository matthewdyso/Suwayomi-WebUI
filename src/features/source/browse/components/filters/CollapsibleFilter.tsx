/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import Collapse from '@mui/material/Collapse';
import { CollapsibleHeader } from '@/base/components/lists/CollapsibleHeader.tsx';

/**
 * Mihon's "CollapsibleBox" of the filter sheet: a heading row that shows or hides a group or sort filter.
 */
export const CollapsibleFilter = ({ name, children }: { name: string; children: ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <CollapsibleHeader title={name} expanded={open} onToggle={() => setOpen(!open)} sx={{ px: 3 }} />
            <Collapse in={open} unmountOnExit>
                {children}
            </Collapse>
        </>
    );
};
