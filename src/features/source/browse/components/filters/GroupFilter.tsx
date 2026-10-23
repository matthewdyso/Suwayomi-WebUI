/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Options } from '@/features/source/browse/components/SourceOptions.tsx';
import type { IPos, SourceFilters } from '@/features/source/Source.types.ts';
import { CollapsibleFilter } from '@/features/source/browse/components/filters/CollapsibleFilter.tsx';

interface Props {
    state: ExtractByKeyValue<SourceFilters, 'type', 'GroupFilter'>['filters'];
    name: string;
    positions: number[];
    updateFilterValue: (value: IPos[]) => void;
    update: any;
}

export const GroupFilter: React.FC<Props> = (props: Props) => {
    const { state, name, positions, updateFilterValue, update } = props;

    return (
        <CollapsibleFilter name={name}>
            <Options
                sourceFilter={state as SourceFilters[]}
                positions={positions}
                updateFilterValue={updateFilterValue}
                update={update}
            />
        </CollapsibleFilter>
    );
};
