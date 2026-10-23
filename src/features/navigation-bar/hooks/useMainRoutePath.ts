/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation } from 'react-router-dom';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { NAVIGATION_BAR_ITEMS } from '@/features/navigation-bar/NavigationBar.constants.ts';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';

/**
 * The path of the navigation destination (home tab) that is currently open, "null" on nested routes.
 */
export const useMainRoutePath = (): NavbarItem['path'] | null => {
    const { pathname } = useLocation();
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const hiddenOnDevice: NavbarItem['show'] = isMobileWidth ? 'desktop' : 'mobile';

    return NAVIGATION_BAR_ITEMS.find(({ path, show }) => show !== hiddenOnDevice && path === pathname)?.path ?? null;
};
