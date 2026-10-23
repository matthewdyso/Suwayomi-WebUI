/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import type { AdaptiveSheetProps } from '@/base/components/modals/AdaptiveSheet.tsx';
import { AdaptiveSheet } from '@/base/components/modals/AdaptiveSheet.tsx';

interface IProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    minHeight?: number;
    header?: AdaptiveSheetProps['header'];
}

export const OptionsPanel: React.FC<IProps> = ({ open, onClose, children, minHeight, header }) => (
    <AdaptiveSheet open={open} onClose={onClose} minHeight={minHeight} header={header}>
        {children}
    </AdaptiveSheet>
);
