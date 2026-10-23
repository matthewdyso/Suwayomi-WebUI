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
 * Hides the top app bar, for screens that start with their own header (Mihon's More tab starts with the logo). The
 * screen pads the top safe-area inset itself.
 */
export const useHiddenAppBar = (enabled: boolean = true) => {
    const { setIsAppBarHidden } = useNavBarContext();

    useLayoutEffect(() => {
        setIsAppBarHidden(enabled);

        return () => setIsAppBarHidden(false);
    }, [enabled]);
};
