/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { tabClasses } from '@mui/material/Tab';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import {
    ReaderSettingsTabsContent,
    ReaderSettingsTabsMenu,
} from '@/features/reader/settings/components/ReaderSettingsTabs.tsx';
import { useDisableAllHotkeysWhileMounted } from '@/features/hotkeys/Hotkeys.utils.ts';
import { getReaderOverlayStore, useReaderSettingsStore } from '@/features/reader/stores/ReaderStore.ts';
import { AdaptiveSheet } from '@/base/components/modals/AdaptiveSheet.tsx';
import { ReaderSettingTab } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { READER_SHEET_MAX_HEIGHT } from '@/features/reader/overlay/ReaderOverlay.utils.ts';

/**
 * Mihon's "TabbedDialog" header: a fixed tab row in surfaceContainerHigh whose single-line tabs share the width
 * (sized by their labels, so a long one like "Custom filter" doesn't wrap on a phone).
 */
const TABS_MENU_SX = {
    bgcolor: 'm3.surfaceContainerHigh',
    [`& .${tabClasses.root}`]: { minWidth: 0, px: 1, flexBasis: 'auto', whiteSpace: 'nowrap' },
} as const;

/**
 * Mihon hides the reader's bars while its colour filter page is open, so the filter's effect can be seen.
 */
const useHideOverlayWhile = (shouldHide: boolean) => {
    useEffect(() => {
        if (!shouldHide) {
            return () => {};
        }

        const wasVisible = getReaderOverlayStore().isVisible;
        getReaderOverlayStore().setIsVisible(false);

        return () => getReaderOverlayStore().setIsVisible(wasVisible);
    }, [shouldHide]);
};

/**
 * Mihon's "ReaderSettingsDialog": the tabbed settings in a sheet (a centered dialog on larger screens).
 */
export const ReaderSettings = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
    const settings = useReaderSettingsStore((state) => state);

    useDisableAllHotkeysWhileMounted(isOpen);

    const [activeTab, setActiveTab] = useState(0);
    const [isTransparent, setIsTransparent] = useState(false);

    const isFilterTabOpen = isOpen && activeTab === ReaderSettingTab.FILTER;
    useHideOverlayWhile(isFilterTabOpen);

    return (
        <AdaptiveSheet
            open={isOpen}
            onClose={close}
            maxHeight={READER_SHEET_MAX_HEIGHT}
            hideBackdrop={isFilterTabOpen}
            transparent={isTransparent}
            header={
                <ReaderSettingsTabsMenu
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    variant="fullWidth"
                    sx={TABS_MENU_SX}
                />
            }
        >
            <ReaderSettingsTabsContent
                activeTab={activeTab}
                settings={settings}
                updateSetting={(...args) => ReaderService.updateSetting(...args)}
                deleteSetting={(...args) => ReaderService.deleteSetting(...args)}
                setTransparent={setIsTransparent}
            />
        </AdaptiveSheet>
    );
};
