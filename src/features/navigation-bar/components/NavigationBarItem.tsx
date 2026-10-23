/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ButtonBase from '@mui/material/ButtonBase';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';
import { M3_STATE_LAYER_SX, m3StateLayerInteractionsSx, m3StateLayerSx } from '@/features/theme/m3/M3StateLayer.ts';

/**
 * - bar: item of the phone's bottom navigation bar
 * - rail: item of the collapsed desktop navigation (navigation rail)
 * - drawer: item of the expanded desktop navigation (navigation drawer)
 */
export type NavigationBarItemVariant = 'bar' | 'rail' | 'drawer';

const INDICATOR_CLASS_NAME = 'NavigationBarItem-indicator';

const INDICATOR_SIZE: Record<Exclude<NavigationBarItemVariant, 'drawer'>, { width: number; height: number }> = {
    bar: { width: 64, height: 32 },
    rail: { width: 56, height: 32 },
};

export const NavigationBarItem = ({
    path,
    title,
    IconComponent,
    SelectedIconComponent,
    useBadge,
    variant,
}: NavbarItem & { variant: NavigationBarItemVariant }) => {
    const { t } = useLingui();
    const { pathname } = useLocation();
    const badgeInfo = useBadge?.();

    const isActive = pathname.startsWith(path);
    const Icon = isActive ? SelectedIconComponent : IconComponent;
    const label = t(title);

    const scrollToTopOnReselect = (e: MouseEvent) => {
        if (pathname !== path) {
            return;
        }

        // Mihon: selecting the active destination again scrolls it to the top without resetting its state
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const icon = (
        <Badge badgeContent={badgeInfo?.count} color="error" max={99}>
            <Icon />
        </Badge>
    );

    if (variant === 'drawer') {
        return (
            <ButtonBase
                component={Link}
                to={path}
                onClick={scrollToTopOnReselect}
                aria-current={isActive ? 'page' : undefined}
                sx={{
                    position: 'relative',
                    width: '100%',
                    minHeight: 56,
                    px: 2,
                    gap: 1.5,
                    justifyContent: 'flex-start',
                    borderRadius: M3_SHAPE.full,
                    color: isActive ? 'm3.onSecondaryContainer' : 'm3.onSurfaceVariant',
                    bgcolor: isActive ? 'm3.secondaryContainer' : undefined,
                    ...m3StateLayerSx(),
                }}
            >
                {icon}
                <Stack sx={{ flexGrow: 1, minWidth: 0, textAlign: 'start' }}>
                    <Typography variant="labelLarge" noWrap>
                        {label}
                    </Typography>
                    {badgeInfo?.title && (
                        <Typography variant="bodySmall" noWrap sx={{ opacity: SECONDARY_ALPHA }}>
                            {badgeInfo.title}
                        </Typography>
                    )}
                </Stack>
            </ButtonBase>
        );
    }

    const isBar = variant === 'bar';

    return (
        <CustomTooltip
            title={
                <>
                    {label}
                    {badgeInfo?.title && (
                        <>
                            <br />
                            {badgeInfo.title}
                        </>
                    )}
                </>
            }
            placement="right"
            disabled={isBar}
        >
            <ButtonBase
                component={Link}
                to={path}
                onClick={scrollToTopOnReselect}
                disableRipple
                aria-current={isActive ? 'page' : undefined}
                sx={{
                    flex: isBar ? '1 1 0' : undefined,
                    minWidth: 0,
                    minHeight: isBar ? 80 : 56,
                    pt: isBar ? 1.5 : 0,
                    flexDirection: 'column',
                    justifyContent: isBar ? 'flex-start' : 'center',
                    gap: 0.5,
                    color: isActive ? 'm3.onSurface' : 'm3.onSurfaceVariant',
                    ...m3StateLayerInteractionsSx(`.${INDICATOR_CLASS_NAME}`),
                }}
            >
                <Box
                    className={INDICATOR_CLASS_NAME}
                    sx={{
                        ...INDICATOR_SIZE[variant],
                        position: 'relative',
                        isolation: 'isolate',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        borderRadius: M3_SHAPE.full,
                        color: isActive ? 'm3.onSecondaryContainer' : 'm3.onSurfaceVariant',
                        '&::before': M3_STATE_LAYER_SX,
                        // the pill grows from its center when its destination gets selected
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: 0,
                            zIndex: -1,
                            borderRadius: 'inherit',
                            bgcolor: 'm3.secondaryContainer',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'scaleX(1)' : 'scaleX(0.5)',
                            transition: [
                                m3Transition(['transform'], M3_SPRING.fastSpatial),
                                m3Transition(['opacity'], M3_SPRING.fastEffects),
                            ].join(', '),
                        },
                    }}
                >
                    {icon}
                </Box>
                <Typography variant={isBar ? 'labelLarge' : 'labelMedium'} noWrap sx={{ maxWidth: '100%', px: 0.5 }}>
                    {label}
                </Typography>
            </ButtonBase>
        </CustomTooltip>
    );
};
