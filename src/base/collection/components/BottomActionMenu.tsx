/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import type { IconButtonProps } from '@mui/material/IconButton';
import { keyframes } from '@mui/material/styles';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';
import type { JSX } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Menu } from '@/base/components/menu/Menu.tsx';
import { useResizeObserver } from '@/base/hooks/useResizeObserver.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_SPRING } from '@/features/theme/m3/M3Motion.constants.ts';

export type BottomActionMenuAction = {
    title: string;
    Icon: OverridableComponent<SvgIconTypeMap<object, 'svg'>>;
    disabled?: boolean;
} & (
    | { onClick: () => void; menu?: never }
    | {
          onClick?: never;
          /**
           * Opens a menu above the button instead, e.g. the download options.
           */
          menu: (onClose: () => void, setHideMenu: (hide: boolean) => void) => JSX.Element | JSX.Element[];
      }
);

const slideIn = keyframes`
    from {
        transform: translateY(100%);
    }
`;

type ActionIconButtonProps = Pick<BottomActionMenuAction, 'title' | 'Icon' | 'disabled'> &
    Omit<IconButtonProps, 'title' | 'disabled'>;

const ActionIconButton = ({ title, Icon, disabled, ...props }: ActionIconButtonProps) => (
    <CustomTooltip title={title} disabled={disabled}>
        <IconButton aria-label={title} color="inherit" disabled={disabled} {...props}>
            <Icon />
        </IconButton>
    </CustomTooltip>
);

const BottomActionMenuButton = ({ menu, onClick, ...button }: BottomActionMenuAction) => {
    if (!menu) {
        return <ActionIconButton {...button} onClick={onClick} />;
    }

    return (
        <PopupState variant="popover" popupId={`bottom-action-menu-${button.title}`}>
            {(popupState) => (
                <>
                    <ActionIconButton {...button} {...bindTrigger(popupState)} />
                    <Menu
                        {...bindMenu(popupState)}
                        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                    >
                        {menu}
                    </Menu>
                </>
            )}
        </PopupState>
    );
};

/**
 * Mihon's bottom action menu of a selection (library and chapter list): the actions as icon buttons on a surface that
 * takes the place of the navigation bar, see "useAppBottomActionMenu".
 */
export const BottomActionMenu = ({
    actions,
    'aria-label': ariaLabel,
}: {
    actions: BottomActionMenuAction[];
    'aria-label': string;
}) => {
    const { setBottomBarHeight } = useNavBarContext();

    const ref = useRef<HTMLDivElement | null>(null);
    useResizeObserver(
        ref,
        useCallback(() => setBottomBarHeight(ref.current?.clientHeight ?? 0), [ref.current]),
    );
    useLayoutEffect(() => () => setBottomBarHeight(0), []);

    return (
        <Box
            ref={ref}
            role="toolbar"
            aria-label={ariaLabel}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.drawer - 1,
                display: 'flex',
                pt: 1.5,
                pb: 'calc(12px + env(safe-area-inset-bottom))',
                pl: 'calc(8px + env(safe-area-inset-left))',
                pr: 'calc(8px + env(safe-area-inset-right))',
                bgcolor: 'm3.surfaceContainerHigh',
                color: 'm3.onSurface',
                borderTopLeftRadius: M3_SHAPE.large,
                borderTopRightRadius: M3_SHAPE.large,
                '@media (prefers-reduced-motion: no-preference)': {
                    animation: `${slideIn} ${M3_SPRING.defaultSpatial.duration}ms ${M3_SPRING.defaultSpatial.easing}`,
                },
            }}
        >
            {actions.map((action) => (
                // Mihon's buttons share the width equally
                <Box key={action.title} sx={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                    <BottomActionMenuButton {...action} />
                </Box>
            ))}
        </Box>
    );
};
