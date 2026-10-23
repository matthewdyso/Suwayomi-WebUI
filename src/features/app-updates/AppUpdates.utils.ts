/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { WebUiChannel } from '@/lib/graphql/generated/graphql-base.types.ts';

export const getWebUIChangelogUrl = (channel: WebUiChannel | undefined): string =>
    channel === WebUiChannel.Stable
        ? 'https://github.com/Suwayomi/Suwayomi-WebUI/releases/latest'
        : 'https://github.com/Suwayomi/Suwayomi-WebUI/blob/master/CHANGELOG.md';

export const getServerChangelogUrl = (buildType: string | undefined, version: string | undefined): string =>
    buildType?.toLowerCase() === 'stable'
        ? `https://github.com/Suwayomi/Suwayomi-Server/releases/tag/${version}`
        : 'https://github.com/Suwayomi/Suwayomi-Server/blob/master/CHANGELOG.md';
