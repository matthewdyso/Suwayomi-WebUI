/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Stack from '@mui/material/Stack';
import GlobalStyles from '@mui/material/GlobalStyles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useLingui } from '@lingui/react/macro';
import { useBackButton } from '@/base/hooks/useBackButton.ts';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { DesktopSideBar } from '@/features/navigation-bar/components/DesktopSideBar.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { MobileBottomBar } from '@/features/navigation-bar/components/MobileBottomBar.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { NAVIGATION_BAR_ITEMS } from '@/features/navigation-bar/NavigationBar.constants.ts';
import { NavigationBarUtil } from '@/features/navigation-bar/NavigationBar.util.ts';
import { useMainRoutePath } from '@/features/navigation-bar/hooks/useMainRoutePath.ts';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';
import { m3Transition } from '@/features/theme/m3/M3Motion.utils.ts';
import { WavyLinearProgress } from '@/base/components/feedback/WavyProgress.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

/**
 * Mihon's pinned top app bar: "surface" at rest, "surfaceContainer" once the content scrolled under it.
 */
export function DefaultNavBar() {
    const {
        title,
        hideTitle,
        action,
        appBarProgress,
        override,
        isCollapsed,
        setIsCollapsed,
        appBarHeight,
        setAppBarHeight,
        bottomBarHeight,
        navBarWidth,
        setNavBarWidth,
        isAppBarOverlay,
        appBarOverlayRevealAfterPx,
        isAppBarFlat,
        isAppBarHidden,
        appBarActionMode,
        bottomActionMenu,
    } = useNavBarContext();

    const { t } = useLingui();
    const getOptionForDirection = useGetOptionForDirection();
    const handleBack = useBackButton();
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    const isScrolled = useScrollTrigger({ disableHysteresis: true, threshold: 0 });
    const isScrolledPastTitleReveal = useScrollTrigger({
        disableHysteresis: true,
        threshold: appBarOverlayRevealAfterPx,
    });

    const {
        settings: { hideHistory },
    } = useMetadataServerSettings();

    const appBarRef = useRef<HTMLDivElement | null>(null);

    const isMainRoute = useMainRoutePath() !== null;
    const actualNavBarWidth = isMobileWidth || isCollapsed ? 0 : navBarWidth;
    const isTransparent = isAppBarOverlay && !isScrolled && !appBarActionMode;
    const isTitleHidden = isAppBarOverlay && !isScrolledPastTitleReveal && !appBarActionMode;

    const visibleNavBarItems = useMemo(
        () =>
            NavigationBarUtil.filterItems(NAVIGATION_BAR_ITEMS, {
                hideHistory,
                hideBoth: false,
                hideDesktop: isMobileWidth,
                hideMobile: !isMobileWidth,
            }),
        [isMobileWidth, hideHistory],
    );
    const NavBarComponent = useMemo(() => (isMobileWidth ? MobileBottomBar : DesktopSideBar), [isMobileWidth]);

    const navBar = useMemo(
        () => <NavBarComponent navBarItems={visibleNavBarItems} />,
        [NavBarComponent, visibleNavBarItems],
    );

    useResizeObserver(
        appBarRef,
        useCallback(() => {
            setAppBarHeight(appBarRef.current?.clientHeight ?? 0);
        }, [appBarRef.current]),
    );

    useLayoutEffect(() => {
        if (override.status) {
            setAppBarHeight(0);
            setNavBarWidth(0);
        }

        return () => {
            setAppBarHeight(0);
            setNavBarWidth(0);
        };
    }, [override.status]);

    useLayoutEffect(() => {
        if (!isMobileWidth) {
            // do not reset navbar width to prevent grid from jumping due to the changing grid item width
            return;
        }

        setNavBarWidth(0);
    }, [isMobileWidth]);

    // Allow default navbar to be overrided
    if (override.status) {
        return override.value;
    }

    return (
        <>
            <GlobalStyles
                styles={{
                    ':root': {
                        [M3_CSS_VARIABLE.appBarHeight]: `${appBarHeight}px`,
                        [M3_CSS_VARIABLE.bottomBarHeight]: `${bottomBarHeight}px`,
                    },
                }}
            />
            <AppBar
                ref={appBarRef}
                sx={{
                    position: 'fixed',
                    marginLeft: `${actualNavBarWidth}px`,
                    pt: 'env(safe-area-inset-top)',
                    pl: isMobileWidth ? 'env(safe-area-inset-left)' : undefined,
                    pr: 'env(safe-area-inset-right)',
                    width: `calc(100% - ${actualNavBarWidth}px)`,
                    zIndex: (theme) => theme.zIndex.drawer,
                    // hidden, not unmounted: the resize observer then reports the height as 0
                    display: isAppBarHidden ? 'none' : undefined,
                    bgcolor: (() => {
                        if (appBarActionMode) {
                            return 'm3.surfaceAtElevation3';
                        }

                        if (isTransparent) {
                            return 'transparent';
                        }

                        return isScrolled && !isAppBarFlat ? 'm3.surfaceContainer' : 'm3.surface';
                    })(),
                }}
            >
                <Toolbar sx={{ position: 'relative' }}>
                    {!isMobileWidth && (
                        <Stack
                            sx={{
                                position: 'absolute',
                                left: 0,
                                width: `calc(${navBarWidth}px + env(safe-area-inset-left))`,
                                ...(!isCollapsed && { display: 'none' }),
                                alignItems: 'center',
                            }}
                        >
                            <IconButton aria-label="open drawer" onClick={() => setIsCollapsed(false)} color="inherit">
                                <MenuRoundedIcon />
                            </IconButton>
                        </Stack>
                    )}
                    <Stack
                        sx={{
                            ml: `${isCollapsed && !isMobileWidth ? navBarWidth : 0}px`,
                            width: `calc(100% - (${isCollapsed && !isMobileWidth ? navBarWidth : 0}px + env(safe-area-inset-left)))`,
                            minWidth: 0,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        {appBarActionMode && (
                            <CustomTooltip title={t`Cancel`}>
                                <IconButton aria-label={t`Cancel`} onClick={appBarActionMode.onCancel} color="inherit">
                                    <CloseRoundedIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        {!appBarActionMode && !isMainRoute && (
                            <IconButton
                                component="button"
                                aria-label={t`Exit to previous page`}
                                onClick={handleBack}
                                color="inherit"
                            >
                                {getOptionForDirection(<ArrowBackRoundedIcon />, <ArrowForwardRoundedIcon />)}
                            </IconButton>
                        )}
                        {(!hideTitle || appBarActionMode) && (
                            <Typography
                                variant="titleLarge"
                                component="h1"
                                noWrap
                                sx={{
                                    flexGrow: 1,
                                    minWidth: 0,
                                    mx: isMainRoute && !appBarActionMode ? 1.5 : 0.5,
                                    opacity: isTitleHidden ? 0 : 1,
                                    transition: m3Transition(['opacity'], M3_SPRING.defaultEffects),
                                }}
                            >
                                {appBarActionMode ? appBarActionMode.title : title}
                            </Typography>
                        )}
                        {appBarActionMode ? appBarActionMode.actions : action}
                    </Stack>
                </Toolbar>
                {appBarProgress && (
                    <WavyLinearProgress
                        {...appBarProgress}
                        sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
                    />
                )}
            </AppBar>
            {(() => {
                if (isMobileWidth && bottomActionMenu) {
                    return bottomActionMenu;
                }

                return !isMobileWidth || isMainRoute ? navBar : null;
            })()}
        </>
    );
}
