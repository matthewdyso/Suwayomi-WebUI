/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { TabsProps } from '@mui/material/Tabs';
import Tabs from '@mui/material/Tabs';
import { tabClasses } from '@mui/material/Tab';
import { styled } from '@mui/material/styles';

/**
 * Mihon's scrollable tab row: surface background, the theme's 1 px divider, tabs at least 90 px wide.
 */
const StyledTabsMenu = styled(Tabs)(({ theme }) => ({
    display: 'flex',
    backgroundColor: theme.palette.m3.surface,
    [`& .${tabClasses.root}`]: {
        minWidth: 90,
    },
}));

export const TabsMenu = ({ children, ...props }: TabsProps) => (
    <StyledTabsMenu indicatorColor="primary" textColor="primary" variant="scrollable" scrollButtons="auto" {...props}>
        {children}
    </StyledTabsMenu>
);
