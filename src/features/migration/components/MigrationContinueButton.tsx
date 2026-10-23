/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import { StyledFab } from '@/base/components/buttons/StyledFab.tsx';

export const MigrationContinueButton = ({
    onClick,
    isDisabled,
    title,
}: {
    onClick: () => void;
    isDisabled?: boolean;
    title?: string;
}) => {
    const { t } = useLingui();

    return (
        <StyledFab variant="extended" color="primary" disabled={isDisabled} onClick={onClick}>
            {title ?? t`Continue`}
        </StyledFab>
    );
};
