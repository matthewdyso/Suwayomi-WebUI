/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AvatarSpinner } from '@/base/components/AvatarSpinner.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { TTrackerBase } from '@/features/tracker/Tracker.types.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

const TRACKER_LOGO_SIZE = 48;

/**
 * Mihon's "TrackLogoIcon": the tracker's logo, 48 px with medium rounded corners.
 */
export const TrackerLogo = ({ name, icon }: Pick<TTrackerBase, 'name' | 'icon'>) => (
    <AvatarSpinner
        alt={name}
        iconUrl={requestManager.getValidImgUrlFor(icon)}
        slots={{
            avatarProps: {
                variant: 'rounded',
                sx: { width: TRACKER_LOGO_SIZE, height: TRACKER_LOGO_SIZE, borderRadius: M3_SHAPE.medium },
            },
            spinnerImageProps: {
                ignoreQueue: true,
            },
        }}
    />
);
