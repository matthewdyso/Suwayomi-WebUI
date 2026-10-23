/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tab from '@mui/material/Tab';
import type { TabsProps } from '@mui/material/Tabs';
import { useLingui } from '@lingui/react/macro';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import type { IReaderSettings, IReaderSettingsWithDefaultFlag } from '@/features/reader/Reader.types.ts';
import { READER_SETTING_TABS, ReaderSettingTab } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { TabPanel } from '@/base/components/tabs/TabPanel.tsx';
import { ReaderLayoutSettings } from '@/features/reader/settings/layout/ReaderLayoutSettings.tsx';
import { ReaderGeneralSettings } from '@/features/reader/settings/general/ReaderGeneralSettings.tsx';
import { ReaderFilterSettings } from '@/features/reader/filters/settings/ReaderFilterSettings.tsx';
import { ReaderBehaviourSettings } from '@/features/reader/settings/behaviour/ReaderBehaviourSettings.tsx';
import { ReaderDefaultLayoutSettings } from '@/features/reader/settings/layout/ReaderDefaultLayoutSettings.tsx';
import { ReaderHotkeysSettings } from '@/features/reader/hotkeys/settings/ReaderHotkeysSettings.tsx';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { OffsetComponentWithContainer } from '@/base/OffsetComponent.tsx';

type ReaderSettingsTabsMenuProps = {
    activeTab: number;
    setActiveTab: (tab: number) => void;
};

type ReaderSettingsTabsContentProps = Pick<ReturnType<typeof ReaderService.useOverlayMode>, 'mode'> &
    Pick<ReaderSettingsTabsMenuProps, 'activeTab'> & {
        settings: IReaderSettingsWithDefaultFlag;
        updateSetting: (...args: Parameters<typeof ReaderService.updateSetting>) => void;
        areDefaultSettings?: boolean;
        deleteSetting: (setting: keyof IReaderSettings) => void;
        setTransparent?: (transparent: boolean) => void;
    };

/**
 * Mihon's "TabbedDialog" pages pad their rows only vertically; the rows bring their horizontal padding.
 */
const TAB_PANEL_SX = { py: 1 } as const;

const useReaderSettingTabs = () => {
    const isTouchDevice = MediaQuery.useIsTouchDevice();

    return Object.values(READER_SETTING_TABS).filter(
        ({ supportsTouchDevices }) => supportsTouchDevices || !isTouchDevice,
    );
};

/**
 * The tab row of the reader settings; on its own, so sheets can keep it above their scrolling content.
 */
export const ReaderSettingsTabsMenu = ({
    activeTab,
    setActiveTab,
    ...tabsProps
}: ReaderSettingsTabsMenuProps & Pick<TabsProps, 'sx' | 'variant'>) => {
    const { t } = useLingui();
    const tabs = useReaderSettingTabs();

    return (
        <TabsMenu value={activeTab} onChange={(_, newTab) => setActiveTab(newTab)} {...tabsProps}>
            {tabs.map(({ id, label }) => (
                <Tab key={id} value={id} label={t(label)} sx={{ flexGrow: 1, maxWidth: 'unset' }} />
            ))}
        </TabsMenu>
    );
};

const BaseReaderSettingsTabsContent = ({
    activeTab,
    areDefaultSettings,
    settings,
    updateSetting,
    deleteSetting,
    mode: overlayMode,
    setTransparent,
}: ReaderSettingsTabsContentProps) => {
    const tabs = useReaderSettingTabs();

    return tabs.map(({ id }) => {
        switch (id) {
            case ReaderSettingTab.LAYOUT:
                if (areDefaultSettings) {
                    return (
                        <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                            <ReaderDefaultLayoutSettings
                                readingMode={settings.readingMode}
                                updateSetting={(...args) => updateSetting(...args)}
                            />
                        </TabPanel>
                    );
                }

                return (
                    <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                        <ReaderLayoutSettings
                            settings={settings}
                            updateSetting={(...args) => updateSetting(...args)}
                            isDefaultable={!areDefaultSettings}
                            onDefault={(...args) => deleteSetting?.(...args)}
                            isSeriesMode
                            setTransparent={setTransparent}
                        />
                    </TabPanel>
                );
            case ReaderSettingTab.GENERAL:
                return (
                    <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                        <ReaderGeneralSettings
                            overlayMode={overlayMode}
                            settings={settings}
                            updateSetting={(...args) => updateSetting(...args)}
                            // @ts-expect-error - TS2322: Type boolean is not assignable to type true
                            isDefaultable={!areDefaultSettings}
                            onDefault={(...args) => deleteSetting?.(...args)}
                        />
                    </TabPanel>
                );
            case ReaderSettingTab.FILTER:
                return (
                    <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                        <ReaderFilterSettings
                            settings={settings}
                            updateSetting={(...args) => updateSetting(...args)}
                            isDefaultable
                            onDefault={(...args) => deleteSetting?.(...args)}
                            setTransparent={setTransparent}
                        />
                    </TabPanel>
                );
            case ReaderSettingTab.BEHAVIOUR:
                return (
                    <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                        <ReaderBehaviourSettings
                            settings={settings}
                            updateSetting={(...args) => updateSetting(...args)}
                            // @ts-expect-error - TS2322: Type boolean is not assignable to type true
                            isDefaultable={!areDefaultSettings}
                            onDefault={(...args) => deleteSetting?.(...args)}
                        />
                    </TabPanel>
                );
            case ReaderSettingTab.HOTKEYS:
                return (
                    <TabPanel key={id} index={id} currentIndex={activeTab} sx={TAB_PANEL_SX}>
                        <ReaderHotkeysSettings
                            settings={settings}
                            updateSetting={(...args) => updateSetting(...args)}
                            isDefaultable
                            onDefault={(...args) => deleteSetting?.(...args)}
                        />
                    </TabPanel>
                );
            default:
                throw new Error(`Unexpected "ReaderSettingTab" (${id})`);
        }
    });
};

/**
 * The pages of the reader settings' tabs.
 */
export const ReaderSettingsTabsContent = withPropsFrom(
    BaseReaderSettingsTabsContent,
    [ReaderService.useOverlayMode],
    ['mode'],
);

/**
 * The reader settings as a page: the tab row sticks to the top while the page scrolls.
 */
export const ReaderSettingsTabs = ({
    setActiveTab,
    ...props
}: Omit<ReaderSettingsTabsContentProps, 'mode'> & ReaderSettingsTabsMenuProps) => (
    <OffsetComponentWithContainer
        sx={{ zIndex: 2 }}
        component={<ReaderSettingsTabsMenu activeTab={props.activeTab} setActiveTab={setActiveTab} />}
    >
        <ReaderSettingsTabsContent {...props} />
    </OffsetComponentWithContainer>
);
