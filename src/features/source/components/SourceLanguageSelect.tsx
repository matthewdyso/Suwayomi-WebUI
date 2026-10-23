/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { GroupedVirtuoso } from 'react-virtuoso';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { useLingui } from '@lingui/react/macro';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { languageSortComparator, toUniqueLanguageCodes } from '@/base/utils/Languages.ts';
import type {
    SourceDisplayNameInfo,
    SourceIconInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceMetaInfo,
    SourceNameInfo,
} from '@/features/source/Source.types.ts';
import { Sources } from '@/features/source/services/Sources';
import { batchUpdateSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import { SourceIcon } from '@/features/source/components/SourceIcon.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { AwaitableComponent, type AwaitableComponentProps } from 'awaitable-component';
import { getISOLanguage } from '@/lib/ISOLanguageUtil.ts';

const SOURCE_ICON_SIZE = 32;

const SourceLanguageSelectDialog = ({
    isVisible,
    onDismiss,
    onSubmit,
    onExitComplete,
    selectedLanguages,
    languages,
    sources,
}: AwaitableComponentProps<{
    selectedLanguages: string[];
    sourceEnabledStateMetaUpdatePayload: Parameters<typeof batchUpdateSourceMetadata>[0];
}> & {
    selectedLanguages: string[];
    languages: string[];
    sources: (SourceIdInfo &
        SourceLanguageInfo &
        SourceNameInfo &
        SourceDisplayNameInfo &
        SourceIconInfo &
        SourceMetaInfo)[];
}) => {
    const { t } = useLingui();

    const [tmpSourceIdToEnabledState, setTmpSourceIdToEnabledState] = useState<Record<SourceIdInfo['id'], boolean>>({});

    const [tmpSelectedLanguages, setTmpSelectedLanguages] = useState(toUniqueLanguageCodes(selectedLanguages));

    const sourcesByLanguage = useMemo(() => Sources.groupByLanguage(sources), [sources]);

    const languagesSortedBySelectState = useMemo(
        () =>
            toUniqueLanguageCodes([
                ...selectedLanguages
                    .filter((language) => languages.includes(language))
                    .toSorted(languageSortComparator),
                ...languages.toSorted(languageSortComparator),
            ]),
        [languages, selectedLanguages],
    );

    const flattenedSourcesByLanguages = useMemo(
        () =>
            languagesSortedBySelectState
                .filter((language) =>
                    tmpSelectedLanguages
                        .filter((selectedLanguage) => languages.includes(selectedLanguage))
                        .includes(language),
                )
                .flatMap((language) => sourcesByLanguage[language] ?? []),
        [languagesSortedBySelectState, sourcesByLanguage, tmpSelectedLanguages],
    );

    const groupCounts = useMemo(
        () =>
            languagesSortedBySelectState.map((language) => {
                const isEnabled = tmpSelectedLanguages
                    .filter((selectedLanguage) => languages.includes(selectedLanguage))
                    .includes(language);
                if (!isEnabled) {
                    return 0;
                }

                return sourcesByLanguage[language].length;
            }),
        [sourcesByLanguage, languagesSortedBySelectState, languages, tmpSelectedLanguages],
    );

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => languagesSortedBySelectState[index], [languagesSortedBySelectState]),
        useCallback((index) => flattenedSourcesByLanguages[index].id, [flattenedSourcesByLanguages]),
    );

    const handleOk = () => {
        onSubmit({
            selectedLanguages: toUniqueLanguageCodes(tmpSelectedLanguages),
            sourceEnabledStateMetaUpdatePayload: Object.entries(tmpSourceIdToEnabledState)
                .map(([sourceId, enabled]) => {
                    const source = sources.find((sourceToEnable) => sourceToEnable.id === sourceId);

                    if (!source) {
                        return null;
                    }

                    return {
                        sources: [source],
                        update: [{ key: 'isEnabled' as const, value: enabled }],
                    };
                })
                .filter((entry) => entry !== null),
        });
    };

    const handleChange = (language: string, selected: boolean) => {
        if (selected) {
            setTmpSelectedLanguages([...tmpSelectedLanguages, language]);
        } else {
            setTmpSelectedLanguages(tmpSelectedLanguages.toSpliced(tmpSelectedLanguages.indexOf(language), 1));
        }
    };

    return (
        <Dialog fullWidth maxWidth="xs" open={isVisible} onClose={onDismiss} onTransitionExited={onExitComplete}>
            <DialogTitle>{t`Enabled languages and sources`}</DialogTitle>
            <DialogContent dividers sx={{ padding: 0 }}>
                {!languages.length && (
                    <Typography variant="bodyMedium" component="p" sx={{ px: 3, py: 2 }}>
                        {t`No sources installed`}
                    </Typography>
                )}
                <GroupedVirtuoso
                    style={{
                        height: languagesSortedBySelectState.length * 54,
                        minHeight: '25vh',
                        maxHeight: '50vh',
                    }}
                    groupCounts={groupCounts}
                    increaseViewportBy={400}
                    computeItemKey={computeItemKey}
                    groupContent={(index) => {
                        const language = languagesSortedBySelectState[index];
                        const isEnabled = tmpSelectedLanguages.includes(language);

                        return (
                            // sticky group header, opaque in the dialog's surface color
                            <ListItem sx={{ bgcolor: 'm3.surfaceContainerHigh' }}>
                                <ListItemText
                                    primary={translateExtensionLanguage(language)}
                                    secondary={getISOLanguage(language)?.name}
                                />
                                <Switch
                                    checked={isEnabled}
                                    onChange={(e) => handleChange(language, e.target.checked)}
                                />
                            </ListItem>
                        );
                    }}
                    itemContent={(index) => {
                        const source = flattenedSourcesByLanguages[index];

                        return (
                            <ListItem sx={{ pl: 3 }}>
                                <ListItemAvatar sx={{ minWidth: 0, mr: 2 }}>
                                    <SourceIcon iconUrl={source.iconUrl} alt={source.name} size={SOURCE_ICON_SIZE} />
                                </ListItemAvatar>
                                <ListItemText primary={source.name} />
                                <Checkbox
                                    checked={
                                        tmpSourceIdToEnabledState[source.id] ??
                                        Sources.isEnabled(source, tmpSelectedLanguages)
                                    }
                                    onChange={(e) =>
                                        setTmpSourceIdToEnabledState({
                                            ...tmpSourceIdToEnabledState,
                                            [source.id]: e.target.checked,
                                        })
                                    }
                                />
                            </ListItem>
                        );
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onDismiss} color="primary">
                    {t`Cancel`}
                </Button>
                <Button onClick={handleOk} color="primary">
                    {t`Ok`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const SourceLanguageSelect = ({
    setSelectedLanguages,
    ...props
}: {
    selectedLanguages: string[];
    setSelectedLanguages: (languages: string[]) => Promise<void>;
    languages: string[];
    sources: (SourceIdInfo &
        SourceLanguageInfo &
        SourceNameInfo &
        SourceDisplayNameInfo &
        SourceIconInfo &
        SourceMetaInfo)[];
}) => {
    const { t } = useLingui();

    return (
        <CustomTooltip title={t`Settings`}>
            <IconButton
                onClick={async () => {
                    try {
                        const { selectedLanguages: updatedSelectedLanguages, sourceEnabledStateMetaUpdatePayload } =
                            await AwaitableComponent.show(SourceLanguageSelectDialog, props);

                        await Promise.all([
                            setSelectedLanguages(updatedSelectedLanguages),
                            batchUpdateSourceMetadata(sourceEnabledStateMetaUpdatePayload),
                        ]).catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));
                    } catch (e) {
                        // Ignore
                    }
                }}
                aria-label="display more actions"
                edge="end"
                color="inherit"
            >
                <FilterListRoundedIcon />
            </IconButton>
        </CustomTooltip>
    );
};
