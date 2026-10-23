/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { MigrationPhase } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import { useLayoutEffect, useState } from 'react';
import { DEFAULT_FAB_STYLE } from '@/base/components/buttons/StyledFab.tsx';

/**
 * Progress of a running migration, shown outside the migration screens; above the navigation bar like a FAB.
 */
export const MigrationFABIndicator = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = MigrationManager.useIsActive();
    const phase = MigrationManager.usePhase();
    const searchProgress = MigrationManager.useSearchProgress();
    const migrationProgress = MigrationManager.useMigrationProgress();

    const [isVisible, setIsVisible] = useState(true);

    useLayoutEffect(() => {
        setIsVisible(true);
    }, [phase]);

    if (!isVisible || !isActive || location.pathname.startsWith(AppRoutes.migrate.path)) {
        return null;
    }

    const isSearching = phase === MigrationPhase.SEARCHING;
    const { completed, total } = isSearching ? searchProgress : migrationProgress;
    const isProgressComplete = completed === total;

    const getLabel = () => {
        if (isSearching) {
            return isProgressComplete ? t`Searching` : t`Searching (${completed}/${total})`;
        }

        return isProgressComplete ? t`Migrating` : t`Migrating (${completed}/${total})`;
    };

    return (
        <Chip
            icon={
                MigrationManager.isPhaseComplete() ? (
                    <DoneAllRoundedIcon />
                ) : (
                    <CircularProgress size={16} color="inherit" />
                )
            }
            label={getLabel()}
            color="primary"
            onClick={() => navigate(AppRoutes.migrate.path)}
            sx={{
                position: DEFAULT_FAB_STYLE.position,
                bottom: DEFAULT_FAB_STYLE.bottom,
                right: DEFAULT_FAB_STYLE.right,
                zIndex: (theme) => theme.zIndex.fab,
                cursor: 'pointer',
            }}
            onDelete={() => setIsVisible(false)}
        />
    );
};
