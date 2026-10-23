/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

/**
 * Shows "menu" in place of the phone's navigation bar ("null" restores it), e.g. Mihon's bottom action menu while
 * items are selected.
 */
export const useAppBottomActionMenu = (
    menu: NavbarContextType['bottomActionMenu'],
    dependencies: unknown[] = STABLE_EMPTY_ARRAY,
) => {
    const { setBottomActionMenu } = useNavBarContext();

    useLayoutEffect(() => {
        setBottomActionMenu(menu);

        return () => setBottomActionMenu(null);
    }, dependencies);
};
