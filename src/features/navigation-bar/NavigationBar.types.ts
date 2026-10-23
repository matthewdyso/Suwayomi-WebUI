/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import type { ReactNode } from 'react';
import type { StaticAppRoute } from '@/base/AppRoute.constants.ts';

export interface INavbarOverride {
    status: boolean;
    value: any;
}

export enum NavBarItemMoreGroup {
    GENERAL,
    HIDDEN_ITEM,
    SETTING_INFO,
}

export interface NavbarItem {
    path: StaticAppRoute;
    title: MessageDescriptor;
    moreTitle?: MessageDescriptor;
    SelectedIconComponent: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    IconComponent: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    show: 'mobile' | 'desktop' | 'both';
    moreGroup: NavBarItemMoreGroup;
    useBadge?: () => { count: number; title: string };
}

/**
 * A determinate progress bar along the app bar's bottom edge, e.g. of a running library update.
 */
export type AppBarProgress = {
    /**
     * 0-100
     */
    value: number;
    'aria-label': string;
};

/**
 * Mihon's action-mode toolbar of a selection: a close button, the number of selected items and the selection's actions.
 */
export type AppBarActionMode = {
    title: ReactNode;
    actions: ReactNode;
    onCancel: () => void;
};

export type NavbarContextType = {
    // AppBar title
    title: string | React.ReactNode;
    setTitle: (title: NavbarContextType['title'], browserTitle?: string) => void;

    hideTitle: boolean;
    setHideTitle: (hide: boolean) => void;

    appBarHeight: number;
    setAppBarHeight: React.Dispatch<React.SetStateAction<number>>;

    // AppBar action buttons
    action: ReactNode;
    setAction: React.Dispatch<React.SetStateAction<ReactNode>>;

    appBarProgress: AppBarProgress | null;
    setAppBarProgress: React.Dispatch<React.SetStateAction<AppBarProgress | null>>;

    // Allow default navbar to be overrided
    override: INavbarOverride;
    setOverride: React.Dispatch<React.SetStateAction<INavbarOverride>>;

    // NavBar
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

    navBarWidth: number;
    setNavBarWidth: React.Dispatch<React.SetStateAction<number>>;

    readerNavBarWidth: number;
    setReaderNavBarWidth: React.Dispatch<React.SetStateAction<number>>;

    bottomBarHeight: number;
    setBottomBarHeight: React.Dispatch<React.SetStateAction<number>>;

    // The app bar is transparent and overlays the content until the window scrolls, its title appears once the window
    // scrolled past "appBarOverlayRevealAfterPx"
    isAppBarOverlay: boolean;
    appBarOverlayRevealAfterPx: number;
    // "null" disables the overlay
    setAppBarOverlayRevealAfterPx: React.Dispatch<React.SetStateAction<number | null>>;

    // The app bar keeps its resting color while the content scrolls, because tabs or chips are attached below it
    isAppBarFlat: boolean;
    setIsAppBarFlat: React.Dispatch<React.SetStateAction<boolean>>;

    // Screens without a top app bar (Mihon's More tab)
    isAppBarHidden: boolean;
    setIsAppBarHidden: React.Dispatch<React.SetStateAction<boolean>>;

    // Replaces the app bar's navigation, title and actions while set
    appBarActionMode: AppBarActionMode | null;
    setAppBarActionMode: React.Dispatch<React.SetStateAction<AppBarActionMode | null>>;

    // Replaces the phone's navigation bar, e.g. Mihon's bottom action menu of a selection
    bottomActionMenu: ReactNode;
    setBottomActionMenu: React.Dispatch<React.SetStateAction<ReactNode>>;
};
