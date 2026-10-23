/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import type { TTrackerBase } from '@/features/tracker/Tracker.types.ts';
import { TrackerLogo } from '@/features/tracker/components/TrackerLogo.tsx';

/**
 * Mihon's "TrackInfoItemEmpty": the tracker's logo and an "Add tracking" button.
 */
export const TrackerUntrackedCard = ({
    tracker,
    onClick,
}: {
    tracker: Pick<TTrackerBase, 'name' | 'icon'>;
    onClick: () => void;
}) => {
    const { t } = useLingui();

    return (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
            <TrackerLogo name={tracker.name} icon={tracker.icon} />
            <Button variant="text" sx={{ flexGrow: 1 }} onClick={onClick}>
                {t`Add tracking`}
            </Button>
        </Stack>
    );
};
