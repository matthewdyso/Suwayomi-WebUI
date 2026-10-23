/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SxProps, Theme } from '@mui/material/styles';
import { formControlLabelClasses } from '@mui/material/FormControlLabel';
import { buttonBaseClasses } from '@mui/material/ButtonBase';

/**
 * Mihon's checkbox, radio and sort items: the glyph sits at the content edge, the label (bodyMedium) 24 px after it.
 *
 * The controls keep their 48 px hit box; its 12 px of space around the glyph is pulled out horizontally.
 */
export const CONTROL_LABEL_SX: SxProps<Theme> = {
    ml: 0,
    mr: 0,
    gap: 3,
    [`& > .${buttonBaseClasses.root}`]: {
        mx: '-12px',
    },
    [`& .${formControlLabelClasses.label}`]: {
        typography: 'bodyMedium',
    },
};
