/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { styled } from '@mui/material/styles';
import { useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { NavigationBarItem } from '@/features/navigation-bar/components/NavigationBarItem.tsx';
import { M3_LAYOUT } from '@/features/theme/m3/M3Layout.constants.ts';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 0.5),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const MIN_WIDTH_EXTENDED = 240;
const MAX_WIDTH_EXTENDED = 400;

/**
 * Expanded: M3 navigation drawer. Collapsed: M3 navigation rail.
 */
export const DesktopSideBar = ({ navBarItems }: { navBarItems: NavbarItem[] }) => {
    const { isCollapsed, setIsCollapsed, navBarWidth, setNavBarWidth } = useNavBarContext();
    const getOptionForDirection = useGetOptionForDirection();

    const ref = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        ref,
        useCallback(() => setNavBarWidth(ref.current?.clientWidth ?? 0), [ref.current]),
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: navBarWidth,
                '& .MuiDrawer-paper': {
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                    border: 0,
                    bgcolor: isCollapsed ? 'm3.surfaceContainer' : 'm3.surfaceContainerLow',
                },
            }}
            slotProps={{
                paper: {
                    ref,
                },
            }}
        >
            <Box
                sx={{
                    pt: 'env(safe-area-inset-top)',
                    pb: 'env(safe-area-inset-bottom)',
                    pl: 'env(safe-area-inset-left)',
                    width: isCollapsed
                        ? `calc(${M3_LAYOUT.navigationRailWidth}px + env(safe-area-inset-left))`
                        : undefined,
                    minWidth: isCollapsed ? undefined : MIN_WIDTH_EXTENDED,
                    maxWidth: isCollapsed ? undefined : MAX_WIDTH_EXTENDED,
                }}
            >
                <DrawerHeader>
                    <IconButton onClick={() => setIsCollapsed(true)}>
                        {getOptionForDirection(<ChevronLeftRoundedIcon />, <ChevronRightRoundedIcon />)}
                    </IconButton>
                </DrawerHeader>
                <Stack
                    component="nav"
                    sx={isCollapsed ? { alignItems: 'center', gap: 1.5, pt: 0.5 } : { p: 1.5, pt: 0.5 }}
                >
                    {navBarItems.map((navBarItem) => (
                        <NavigationBarItem
                            key={navBarItem.path}
                            {...navBarItem}
                            variant={isCollapsed ? 'rail' : 'drawer'}
                        />
                    ))}
                </Stack>
            </Box>
        </Drawer>
    );
};
