/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SxProps, Theme } from '@mui/material/styles';
import { M3_DRAGGED_ITEM_SX, M3_ELEVATION } from '@/features/theme/m3/M3Elevation.constants.ts';

/**
 * The opaque surface of a download queue header or item, lifted while it is dragged.
 */
export const getDownloadQueueItemSx = (isDragged: boolean): SxProps<Theme> =>
    isDragged ? M3_DRAGGED_ITEM_SX : { bgcolor: 'm3.surface', boxShadow: M3_ELEVATION.level0 };
