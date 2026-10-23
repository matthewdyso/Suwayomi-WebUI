/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { NavigationBarItem } from '@/features/navigation-bar/components/NavigationBarItem.tsx';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * The M3 navigation bar of Mihon's home screen.
 */
export const MobileBottomBar = ({ navBarItems }: { navBarItems: NavbarItem[] }) => {
    const { setBottomBarHeight } = useNavBarContext();

    const ref = useRef<HTMLElement | null>(null);
    useResizeObserver(
        ref,
        useCallback(() => setBottomBarHeight(ref.current?.clientHeight ?? 0), [ref.current]),
    );
    useLayoutEffect(() => () => setBottomBarHeight(0), []);

    return (
        <Box
            ref={ref}
            component="nav"
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.drawer - 1,
                display: 'flex',
                minHeight: `calc(${M3_LAYOUT.navigationBarHeight}px + env(safe-area-inset-bottom))`,
                pb: 'env(safe-area-inset-bottom)',
                pl: 'env(safe-area-inset-left)',
                pr: 'env(safe-area-inset-right)',
                bgcolor: 'm3.surfaceContainer',
            }}
        >
            {navBarItems.map((item) => (
                <NavigationBarItem key={item.path} {...item} variant="bar" />
            ))}
        </Box>
    );
};
