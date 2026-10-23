/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { Sources } from '@/features/source/services/Sources';
import type { TMigratableSource } from '@/features/migration/Migration.types.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { Pill } from '@/base/components/badges/Pill.tsx';
import { SourceIcon } from '@/features/source/components/SourceIcon.tsx';

/**
 * Mihon's "MigrateSourceItem": icon, name and language, and the number of library entries from that source.
 */
export const MigrationCard = memo((source: TMigratableSource) => {
    const { id, name, lang, iconUrl, mangaCount } = source;
    const { t } = useLingui();

    const sourceName = Sources.isLocalSource(source) ? t`Local source` : name;

    return (
        <ListRow
            minHeight={64}
            leading={<SourceIcon iconUrl={iconUrl} alt={sourceName} />}
            headline={sourceName}
            headlineVariant="bodyMedium"
            supporting={translateExtensionLanguage(lang)}
            supportingVariant="bodySmall"
            supportingMaxLines={1}
            onClick={() => {
                MigrationManager.selectSources([id]);
                ReactRouter.navigate(AppRoutes.migrate.path);
            }}
            trailing={<Pill sx={{ typography: 'bodySmall' }}>{mangaCount}</Pill>}
        />
    );
});
