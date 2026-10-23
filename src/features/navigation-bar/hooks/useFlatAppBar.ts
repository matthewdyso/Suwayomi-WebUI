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
 * Keeps the app bar in its resting color while the content scrolls, for screens that attach tabs or a chip bar below
 * it, so bar and attachment stay one surface (Mihon: the library drops its scroll behavior while it shows category
 * tabs, browse and source screens have none).
 */
export const useFlatAppBar = (enabled: boolean = true) => {
    const { setIsAppBarFlat } = useNavBarContext();

    useLayoutEffect(() => {
        setIsAppBarFlat(enabled);

        return () => setIsAppBarFlat(false);
    }, [enabled]);
};
