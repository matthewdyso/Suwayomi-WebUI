/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import React, { useEffect } from 'react';
import { useDebounce } from '@/base/hooks/useDebounce.ts';
import type { IPos } from '@/features/source/Source.types.ts';
import isEqual from 'lodash/fp/isEqual';

interface Props {
    state: string;
    name: string;
    positions: number[];
    updateFilterValue: (value: IPos[]) => void;
    update: any;
}

export const TextFilter: React.FC<Props> = (props) => {
    const { state, name, positions, updateFilterValue, update } = props;
    const [Search, setsearch] = React.useState(state || '');
    const inputText = useDebounce(Search, 500);

    useEffect(() => {
        const upd = update.filter((el: { positions: number }) => !isEqual(positions, el.positions));
        updateFilterValue([...upd, { type: 'textState', positions, state: inputText }]);
    }, [inputText]);

    if (state !== undefined) {
        return (
            <Box sx={{ px: 3, py: 0.5 }}>
                <FormControl fullWidth>
                    <InputLabel>{name}</InputLabel>
                    <OutlinedInput
                        label={name}
                        name={name}
                        value={Search}
                        onChange={({ target: { value } }) => setsearch(value)}
                        endAdornment={
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        }
                    />
                </FormControl>
            </Box>
        );
    }
    return null;
};
