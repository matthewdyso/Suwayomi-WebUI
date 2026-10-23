/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MigrationEntryStatus, TMigrationEntry } from '@/features/migration/Migration.types.ts';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { MigrationEntry } from '@/features/migration/components/migration-entry/MigrationEntry.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { OffsetComponentWithContainer } from '@/base/OffsetComponent.tsx';
import { Virtuoso } from 'react-virtuoso';
import { CollapsibleHeader } from '@/base/components/lists/CollapsibleHeader.tsx';

const VirtuosoListWrapper = memo(({ children, ...props }: { children?: ReactNode }) => (
    <Stack {...props} sx={{ gap: 1 }}>
        {children}
    </Stack>
));

export const MigrationEntryGroup = memo(
    ({
        status,
        title,
        entries,
        color,
        isMigrating = false,
        isAborted = false,
    }: {
        status: MigrationEntryStatus;
        title: string;
        entries: TMigrationEntry[];
        color: 'info' | 'error' | 'warning' | 'success';
        isMigrating?: boolean;
        isAborted?: boolean;
    }) => {
        const isExpanded = MigrationManager.useGroupExpandState(status);

        if (!entries.length) {
            return null;
        }

        return (
            <Stack sx={{ width: '100%', gap: 1 }}>
                <OffsetComponentWithContainer
                    wrapperComponent={Stack}
                    sx={{ backgroundColor: 'm3.surface' }}
                    component={
                        // in the color of the group's status
                        <CollapsibleHeader
                            title={title}
                            titleComponent="h2"
                            expanded={isExpanded}
                            onToggle={() => MigrationManager.setGroupExpandState(status, !isExpanded)}
                            sx={{ mx: -2, color: `${color}.main`, bgcolor: 'm3.surface' }}
                        />
                    }
                >
                    <Collapse in={isExpanded}>
                        <Virtuoso
                            useWindowScroll
                            totalCount={entries.length}
                            components={{
                                List: VirtuosoListWrapper,
                            }}
                            computeItemKey={(index) => entries[index].mangaId}
                            itemContent={(index) => (
                                <MigrationEntry
                                    entry={entries[index]}
                                    isMigrating={isMigrating}
                                    isAborted={isAborted}
                                />
                            )}
                        />
                    </Collapse>
                </OffsetComponentWithContainer>
            </Stack>
        );
    },
);
