/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export type SelectPreferenceOption<Value extends string | number> = {
    value: Value;
    label: string;
    description?: string;
};

/**
 * A preference row that shows the selected option as its subtitle and opens a menu of the options; picking one applies
 * it right away.
 *
 * Use it for plain choices (option label plus an optional description). Use `SelectSetting` (a dialog with Ok and
 * Cancel) when a choice needs explaining before it's applied, i.e. per-value descriptions or disclaimers; upstream's
 * settings screens keep using it as they are.
 */
export const SelectPreference = <Value extends string | number>({
    title,
    description,
    value,
    options,
    onChange,
    disabled,
}: {
    title: string;
    /**
     * Shown under the selected option.
     */
    description?: string;
    value: Value;
    options: SelectPreferenceOption<Value>[];
    onChange: (value: Value) => void;
    disabled?: boolean;
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const selectedOption = options.find((option) => option.value === value);
    const close = () => setAnchorEl(null);

    return (
        <>
            <ListItemButton
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={!!anchorEl}
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                <ListItemText
                    primary={title}
                    secondary={
                        <>
                            <span>{selectedOption?.label ?? value}</span>
                            {description && <span>{description}</span>}
                        </>
                    }
                    slotProps={{ secondary: { sx: { display: 'flex', flexDirection: 'column' } } }}
                />
            </ListItemButton>
            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === value}
                        onClick={() => {
                            close();
                            if (option.value !== value) {
                                onChange(option.value);
                            }
                        }}
                    >
                        <ListItemText primary={option.label} secondary={option.description} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};
