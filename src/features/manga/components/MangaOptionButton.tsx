/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BaseSyntheticEvent, ChangeEvent, ForwardedRef } from 'react';
import { useMemo } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import type { SxProps, Theme } from '@mui/material/styles';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import type { PopupState } from 'material-ui-popup-state/hooks';
import { bindTrigger } from 'material-ui-popup-state';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import type { SelectableCollectionReturnType } from '@/base/collection/hooks/useSelectableCollection.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { getCoverIconButtonSx } from '@/features/manga/components/cards/CoverIconButton.styles.ts';

/**
 * Touch devices open the menu with a long press (like Mihon, which has no options button on its items): the button
 * stays in the DOM as the menu's anchor, invisible and out of the layout.
 */
const HIDDEN_ON_TOUCH_SX: SxProps<Theme> = {
    '@media not (pointer: fine)': {
        position: 'absolute',
        insetInlineEnd: 0,
        visibility: 'hidden',
        width: 0,
        height: 0,
        p: 0,
        m: 0,
        border: 0,
    },
};

const preventDefaultAction = (e: BaseSyntheticEvent) => {
    e.stopPropagation();
    e.preventDefault();
};

export const MangaOptionButton = ({
    id,
    selected,
    handleSelection,
    asCheckbox = false,
    popupState,
    ref,
}: {
    id: number;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<MangaIdInfo['id']>['handleSelection'];
    asCheckbox?: boolean;
    popupState: PopupState;
    ref?: ForwardedRef<HTMLButtonElement | null>;
}) => {
    const { t } = useLingui();

    const bindTriggerProps = useMemo(() => bindTrigger(popupState), [popupState]);

    const handleSelectionChange = (e: ChangeEvent, isSelected: boolean) => {
        preventDefaultAction(e);
        handleSelection?.(id, isSelected);
    };

    if (!handleSelection) {
        return null;
    }

    const isSelected = selected !== null;
    if (isSelected) {
        if (!asCheckbox) {
            return null;
        }

        return (
            <CustomTooltip title={selected ? t`Deselect` : t`Select`}>
                <Checkbox
                    {...MUIUtil.preventRippleProp()}
                    edge="end"
                    checked={selected}
                    onChange={handleSelectionChange}
                />
            </CustomTooltip>
        );
    }

    if (asCheckbox) {
        return (
            <CustomTooltip title={t`Options`}>
                <IconButton
                    ref={ref}
                    {...MUIUtil.preventRippleProp(bindTriggerProps, { onClick: preventDefaultAction })}
                    aria-label="more"
                    edge="end"
                    sx={HIDDEN_ON_TOUCH_SX}
                >
                    <MoreVertRounded />
                </IconButton>
            </CustomTooltip>
        );
    }

    return (
        <CustomTooltip title={t`Options`}>
            <ButtonBase
                ref={ref}
                {...MUIUtil.preventRippleProp(bindTriggerProps, { onClick: preventDefaultAction })}
                className="manga-option-button"
                sx={MUIUtil.mergeSx(
                    getCoverIconButtonSx('small', true),
                    {
                        visibility: popupState.isOpen ? 'visible' : 'hidden',
                        pointerEvents: 'none',
                    },
                    HIDDEN_ON_TOUCH_SX,
                )}
            >
                <MoreVertRounded />
            </ButtonBase>
        </CustomTooltip>
    );
};
