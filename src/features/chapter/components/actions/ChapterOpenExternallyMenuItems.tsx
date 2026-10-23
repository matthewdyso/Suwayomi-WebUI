/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { MenuItem } from '@/base/components/menu/MenuItem.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { ChapterRealUrlInfo } from '@/features/chapter/Chapter.types.ts';
import { IconWebView } from '@/assets/icons/IconWebView.tsx';
import { IconBrowser } from '@/assets/icons/IconBrowser.tsx';

/**
 * Opens the chapter on the source's website, directly or through the server's WebView.
 */
export const ChapterOpenExternallyMenuItems = ({
    chapter: { realUrl },
    onClose,
}: {
    chapter: ChapterRealUrlInfo;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    return (
        <>
            <MenuItem
                Icon={IconBrowser}
                disabled={!realUrl}
                onClick={() => {
                    window.open(realUrl!, '_blank', 'noopener,noreferrer');
                    onClose();
                }}
                title={t`Open in browser`}
            />
            <MenuItem
                Icon={IconWebView}
                disabled={!realUrl}
                onClick={() => {
                    window.open(requestManager.getWebviewUrl(realUrl!), '_blank', 'noopener,noreferrer');
                    onClose();
                }}
                title={t`Open in WebView`}
            />
        </>
    );
};
