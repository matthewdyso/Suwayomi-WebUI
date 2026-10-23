/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import React, { useState } from 'react';
import { TabPanel } from '@/base/components/tabs/TabPanel.tsx';
import { OptionsPanel } from '@/base/components/modals/OptionsPanel.tsx';

interface IProps<T = string> {
    open: boolean;
    onClose: () => void;
    tabs: T[];
    tabTitle: (key: T) => React.ReactNode;
    tabContent: (key: T) => React.ReactNode;
    minHeight?: number;
    /**
     * Shown at the end of the tab row (Mihon's TabbedDialog overflow), e.g. a reset button.
     */
    tabRowEnd?: React.ReactNode;
}

export const OptionsTabs = <T extends string = string>({
    open,
    onClose,
    tabs,
    tabTitle,
    tabContent,
    minHeight,
    tabRowEnd,
}: IProps<T>) => {
    const [tabNum, setTabNum] = useState(0);

    return (
        <OptionsPanel
            open={open}
            onClose={onClose}
            minHeight={minHeight}
            header={
                // the divider spans the whole row, under the end slot too
                <Stack
                    sx={(theme) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        boxShadow: `inset 0 -1px 0 ${theme.palette.m3.outlineVariant}`,
                    })}
                >
                    <Tabs
                        value={tabNum}
                        variant="fullWidth"
                        onChange={(e, newTab) => setTabNum(newTab)}
                        indicatorColor="primary"
                        textColor="primary"
                        sx={{ flexGrow: 1, boxShadow: 'none' }}
                    >
                        {tabs.map((tab, tabIndex) => (
                            <Tab key={tab} value={tabIndex} label={tabTitle(tab)} />
                        ))}
                    </Tabs>
                    {tabRowEnd}
                </Stack>
            }
        >
            {tabs.map((tab, tabIndex) => (
                <TabPanel key={tab} index={tabIndex} currentIndex={tabNum}>
                    {/* Mihon's TabbedDialog paddings; the rows are full-bleed and pad themselves */}
                    <Stack sx={{ py: 1, minHeight }}>{tabContent(tab)}</Stack>
                </TabPanel>
            ))}
        </OptionsPanel>
    );
};
