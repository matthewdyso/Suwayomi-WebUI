/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { AppBarActionMode } from '@/features/navigation-bar/NavigationBar.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

/**
 * Turns the app bar into Mihon's action-mode toolbar while "actionMode" is set ("null" restores the screen's bar).
 *
 * Call it from the screen's content, not from inside the app bar: the action mode replaces the bar's actions.
 */
export const useAppBarActionMode = (
    actionMode: AppBarActionMode | null,
    dependencies: unknown[] = STABLE_EMPTY_ARRAY,
) => {
    const { setAppBarActionMode } = useNavBarContext();

    useLayoutEffect(() => {
        setAppBarActionMode(actionMode);

        return () => setAppBarActionMode(null);
    }, dependencies);
};
