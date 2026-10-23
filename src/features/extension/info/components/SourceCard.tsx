/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Switch from '@mui/material/Switch';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Sources } from '@/features/source/services/Sources.ts';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { createUpdateSourceMetadata, useGetSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import type {
    SourceConfigurableInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceMetaInfo,
} from '@/features/source/Source.types.ts';
import { getISOLanguage } from '@/lib/ISOLanguageUtil.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';

/**
 * Mihon's "SourceSwitchPreference": a source of the extension with its settings and whether it is enabled.
 */
export const SourceCard = (source: SourceIdInfo & SourceMetaInfo & SourceLanguageInfo & SourceConfigurableInfo) => {
    const { id, isConfigurable } = source;

    const { t } = useLingui();
    const { isEnabled } = useGetSourceMetadata(source);
    const { languages, setLanguages } = Sources.useLanguages();

    const isLanguageEnabled = useMemo(() => Sources.isLanguageEnabled(source, languages), [languages, source.lang]);
    const finalIsEnabled = useMemo(() => Sources.isEnabled(source, languages), [source, languages]);

    const updateSetting = createUpdateSourceMetadata(source, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    const toggleEnabled = () => {
        if (!isLanguageEnabled) {
            setLanguages([...languages, source.lang]);

            if (!isEnabled) {
                updateSetting('isEnabled', !isEnabled);
            }

            return;
        }

        updateSetting('isEnabled', !isEnabled);
    };

    const isoLanguageName = getISOLanguage(Sources.getLanguage(source))?.name;

    return (
        <ListRow
            minHeight={isoLanguageName ? 72 : 56}
            headline={translateExtensionLanguage(Sources.getLanguage(source))}
            supporting={isoLanguageName}
            onClick={toggleEnabled}
            trailing={
                <>
                    {isConfigurable && (
                        <CustomTooltip title={t`Settings`}>
                            <IconButton
                                component={Link}
                                to={AppRoutes.sources.children.configure.path(id)}
                                sx={{ color: 'm3.onSurface' }}
                            >
                                <SettingsRoundedIcon />
                            </IconButton>
                        </CustomTooltip>
                    )}
                    <Switch
                        checked={finalIsEnabled}
                        onChange={toggleEnabled}
                        slotProps={{ input: { 'aria-label': translateExtensionLanguage(Sources.getLanguage(source)) } }}
                    />
                </>
            }
        />
    );
};
