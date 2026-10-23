/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';

/**
 * Lets the screen's content start under a transparent app bar (Mihon's manga toolbar).
 *
 * While enabled, the app bar is transparent until the window scrolls, then it takes the scrolled color; its title stays
 * hidden until the window scrolled past "revealAfterPx" (Mihon's MangaScreen). The main container no longer offsets the content by the app bar height, the
 * screen has to pad itself with "appBarHeight" of the NavbarContext.
 */
export const useAppBarOverlay = (enabled: boolean, revealAfterPx: number = 0) => {
    const { setAppBarOverlayRevealAfterPx } = useNavBarContext();

    useLayoutEffect(() => {
        setAppBarOverlayRevealAfterPx(enabled ? revealAfterPx : null);

        return () => setAppBarOverlayRevealAfterPx(null);
    }, [enabled, revealAfterPx]);
};
