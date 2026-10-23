/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import { listItemClasses } from '@mui/material/ListItem';
import { listItemButtonClasses } from '@mui/material/ListItemButton';
import { switchClasses } from '@mui/material/Switch';
import { styled } from '@mui/material/styles';

// `padding` skips ListItems with `disablePadding` that only wrap a ListItemButton row
const ROWS = [listItemClasses.padding, listItemButtonClasses.root].map((row) => `& .${row}`).join(', ');
const TRAILING_SWITCHES = [listItemClasses.root, listItemButtonClasses.root]
    .map((row) => `& .${row} > .${switchClasses.root}`)
    .join(', ');

/**
 * A list of Mihon preference rows (`BasePreferenceWidget`), for settings screens.
 *
 * Rows get Mihon's 16 px around their text (12 px padding plus the 4 px margin of `ListItemText`), so a one-line row
 * is 56 px and a row with a subtitle 72 px, and trailing switches keep a 16 px buffer to the text. Nested lists
 * (groups with a `ListSubheader`) and the settings components inside it inherit both.
 */
export const PreferenceList = styled(List)({
    [ROWS]: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    [TRAILING_SWITCHES]: {
        flexShrink: 0,
        marginLeft: 16,
    },
}) as typeof List;
