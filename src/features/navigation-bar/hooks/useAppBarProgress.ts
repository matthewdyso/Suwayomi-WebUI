/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect } from 'react';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import type { AppBarProgress } from '@/features/navigation-bar/NavigationBar.types.ts';

/**
 * Shows a wavy progress bar along the app bar's bottom edge while "progress" is set (Mihon's indicator of a running
 * library update).
 */
export const useAppBarProgress = (progress: AppBarProgress | null) => {
    const { setAppBarProgress } = useNavBarContext();

    const value = progress?.value;
    const label = progress?.['aria-label'];

    useLayoutEffect(() => {
        setAppBarProgress(value === undefined || label === undefined ? null : { value, 'aria-label': label });

        return () => setAppBarProgress(null);
    }, [value, label]);
};
