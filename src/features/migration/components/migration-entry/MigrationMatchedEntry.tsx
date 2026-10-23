/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import type { MigrationMatch } from '@/features/migration/Migration.types.ts';
import { MigrationEntryCard } from '@/features/migration/components/migration-entry/MigrationEntryCard.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { MigrationEntryCardContent } from '@/features/migration/components/migration-entry/MigrationEntryCardContent.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { MigrationEntryMetadataText } from '@/features/migration/components/migration-entry/MigrationEntryMetadataText.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { memo } from 'react';
import { MigrationEntryThumbnail } from '@/features/migration/components/migration-entry/MigrationEntryThumbnail.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';

export const MigrationMatchedEntry = memo(
    ({ sourceMangaId, entry }: { sourceMangaId: MangaIdInfo['id']; entry: MigrationMatch }) => {
        const { t } = useLingui();

        return (
            <MigrationEntryCard sx={{ mb: 1 }}>
                <CardActionArea onClick={() => MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId)}>
                    <MigrationEntryCardContent>
                        {(() => (
                            <>
                                <MigrationEntryThumbnail
                                    id={entry.id}
                                    title={entry.title}
                                    thumbnailUrl={Mangas.getThumbnailUrl(entry)}
                                    inLibrary={entry.inLibrary}
                                    height={80}
                                />
                                <Stack sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography variant="labelMedium" sx={{ color: 'm3.onSurfaceVariant' }}>
                                        {entry.sourceTitle}
                                    </Typography>
                                    <Link
                                        component={RouterLink}
                                        to={AppRoutes.manga.path(entry.id)}
                                        sx={{ textDecoration: 'none', color: 'inherit', width: 'fit-content' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <TypographyMaxLines variant="titleMedium" component="h3" title={entry.title}>
                                            {entry.title}
                                        </TypographyMaxLines>
                                    </Link>
                                    <MigrationEntryMetadataText {...entry} />
                                </Stack>
                            </>
                        ))()}
                        {(() => (
                            <Button
                                variant="tonal"
                                {...MUIUtil.preventRippleProp({
                                    onClick: () =>
                                        MigrationManager.selectMatch(sourceMangaId, entry.id, entry.sourceId),
                                })}
                            >{t`Select`}</Button>
                        ))()}
                    </MigrationEntryCardContent>
                </CardActionArea>
            </MigrationEntryCard>
        );
    },
);
