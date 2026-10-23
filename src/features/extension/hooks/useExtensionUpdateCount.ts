/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

/**
 * The number of installed extensions with an update, from the extension list the app fetches on startup.
 */
export const useExtensionUpdateCount = (): number => {
    const { data } = requestManager.useGetExtensionList({ fetchPolicy: 'cache-only' });
    const extensions = data?.extensions.nodes ?? STABLE_EMPTY_ARRAY;

    return useMemo(
        () => extensions.filter((extension) => extension.hasUpdate && !extension.isObsolete).length,
        [extensions],
    );
};
