/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { SortItem } from '@/base/components/settings/SheetRows.tsx';
import { CollapsibleFilter } from '@/features/source/browse/components/filters/CollapsibleFilter.tsx';
import type { SortSelectionInput } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { IPos } from '@/features/source/Source.types.ts';
import isEqual from 'lodash/fp/isEqual';

interface Props {
    values: any;
    name: string;
    state: SortSelectionInput;
    positions: number[];
    updateFilterValue: (value: IPos[]) => void;
    update: any;
}

export const SortFilter: React.FC<Props> = (props: Props) => {
    const { values, name, state, positions, updateFilterValue, update } = props;
    const [val, setval] = React.useState(state);

    if (values) {
        const handleChange = (index: number) => {
            const tmp = val;
            if (tmp.index === index) {
                tmp.ascending = !tmp.ascending;
            } else {
                tmp.ascending = true;
            }
            tmp.index = index;
            setval(tmp);
            const upd = update.filter((e: { positions: number[] }) => !isEqual(positions, e.positions));
            updateFilterValue([...upd, { type: 'sortState', positions, state: tmp }]);
        };

        return (
            <CollapsibleFilter name={name}>
                {values.map((value: string, index: number) => (
                    <SortItem
                        key={`${name} ${value}`}
                        label={value}
                        checked={val.index === index}
                        sortDescending={!val.ascending}
                        onClick={() => handleChange(index)}
                    />
                ))}
            </CollapsibleFilter>
        );
    }
    return null;
};
