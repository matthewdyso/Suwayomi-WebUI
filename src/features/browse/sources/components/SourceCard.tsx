/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import IconButton from '@mui/material/IconButton';
import { useLingui } from '@lingui/react/macro';
import type { GetSourcesListQuery } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Sources } from '@/features/source/services/Sources.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { createUpdateSourceMetadata, useGetSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { SourceContentType } from '@/features/source/Source.types.ts';
import { isNsfw } from '@/features/extension/Extensions.utils.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import { SourceIcon } from '@/features/source/components/SourceIcon.tsx';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';

interface IProps {
    source: GetSourcesListQuery['sources']['nodes'][number];
    showSourceRepo: boolean;
    showLanguage: boolean;
}

/**
 * Mihon's "SourceItem": icon, name and language, "Latest" and the pin button.
 */
export const SourceCard: React.FC<IProps> = (props: IProps) => {
    const { t } = useLingui();

    const { source, showSourceRepo, showLanguage } = props;
    const {
        id,
        name,
        lang,
        iconUrl,
        supportsLatest,
        contentWarning,
        extension: { extensionStore },
    } = source;

    const { isPinned } = useGetSourceMetadata(source);

    const sourceName = Sources.isLocalSource(source) ? t`Local source` : name;
    const showStore = showSourceRepo && !!extensionStore;
    const showNsfw = isNsfw(contentWarning);
    const facts = [showLanguage && languageCodeToName(lang), showStore && extensionStore.name].filter(Boolean);

    const browsePath = AppRoutes.sources.children.browse.path(id);

    const updateSetting = createUpdateSourceMetadata(source, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    return (
        <ListRow
            minHeight={64}
            leading={<SourceIcon iconUrl={iconUrl} alt={sourceName} />}
            headline={sourceName}
            headlineVariant="bodyMedium"
            supportingVariant="bodySmall"
            supportingMaxLines={1}
            supporting={
                (!!facts.length || showNsfw) && (
                    <>
                        {facts.join(' • ')}
                        {showNsfw && (
                            <Box component="span" sx={{ color: 'm3.error' }}>
                                {' 18+'}
                            </Box>
                        )}
                    </>
                )
            }
            to={browsePath}
            state={AppRoutes.sources.children.browse.state({
                contentType: SourceContentType.POPULAR,
                clearCache: true,
            })}
            trailing={
                <>
                    {supportsLatest && (
                        // large: Mihon's text buttons keep a 48 px touch target
                        <Button
                            size="large"
                            component={Link}
                            to={browsePath}
                            state={AppRoutes.sources.children.browse.state({
                                contentType: SourceContentType.LATEST,
                                clearCache: true,
                            })}
                        >
                            {t`Latest`}
                        </Button>
                    )}
                    <CustomTooltip title={isPinned ? t`Unpin source` : t`Pin source`}>
                        <IconButton
                            onClick={() => updateSetting('isPinned', !isPinned)}
                            sx={{ color: isPinned ? 'm3.primary' : 'm3.onBackground' }}
                        >
                            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon sx={{ opacity: SECONDARY_ALPHA }} />}
                        </IconButton>
                    </CustomTooltip>
                </>
            }
        />
    );
};
