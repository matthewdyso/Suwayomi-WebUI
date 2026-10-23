/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import type { CustomContentProps, VariantType } from 'notistack';
import { closeSnackbar, SnackbarContent } from 'notistack';
import type { ForwardedRef } from 'react';
import { Fragment, memo } from 'react';
import Alert, { alertClasses } from '@mui/material/Alert';
import AlertTitle, { alertTitleClasses } from '@mui/material/AlertTitle';
import Button, { buttonClasses } from '@mui/material/Button';
import { iconButtonClasses } from '@mui/material/IconButton';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { extractGraphqlExceptionInfo } from '@/lib/HelperFunctions.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import { M3_ELEVATION } from '@/features/theme/m3/M3Elevation.constants.ts';

const MAX_DESCRIPTION_LENGTH = 200;

const SNACKBAR_VARIANT_TO_TRANSLATION: Record<VariantType, MessageDescriptor> = {
    default: msg`Information`,
    info: msg`Information`,
    success: msg`Success`,
    warning: msg`Warning`,
    error: msg`Error`,
};

export const SnackbarWithDescription = memo(
    ({
        id,
        message,
        description,
        variant,
        action,
        ref,
    }: CustomContentProps & {
        description?: string;
        ref?: ForwardedRef<HTMLDivElement>;
    }) => {
        const { t } = useLingui();

        const severity = variant === 'default' ? 'info' : variant;
        const finalAction = typeof action === 'function' ? action(id) : action;

        const { isGraphqlException, graphqlError, graphqlStackTrace } = extractGraphqlExceptionInfo(description);

        const finalDescription = isGraphqlException ? graphqlError : description;
        const isDescriptionTooLong = (finalDescription?.length ?? 0) > MAX_DESCRIPTION_LENGTH;
        const actualDescription = isDescriptionTooLong
            ? finalDescription?.slice(0, MAX_DESCRIPTION_LENGTH)
            : finalDescription;

        const TitleComponent = actualDescription?.length ? AlertTitle : Fragment;

        return (
            <SnackbarContent ref={ref}>
                {/* M3 snackbar look; the severity icon stays, so errors remain distinguishable at a glance */}
                <Alert
                    severity={severity}
                    action={finalAction}
                    sx={{
                        width: '100%',
                        minHeight: 48,
                        alignItems: 'center',
                        py: 0.5,
                        pl: 2,
                        pr: 1,
                        wordBreak: 'break-word',
                        borderRadius: M3_SHAPE.extraSmall,
                        bgcolor: 'm3.inverseSurface',
                        color: 'm3.inverseOnSurface',
                        boxShadow: M3_ELEVATION.level3,
                        [`& .${alertClasses.icon}`]: {
                            py: 0,
                            mr: 1.5,
                            color: severity === 'error' ? 'm3.inverseError' : 'm3.inversePrimary',
                        },
                        [`& .${alertClasses.message}`]: { py: 1.25 },
                        [`& .${alertClasses.action}`]: { py: 0, mr: 0, alignItems: 'center' },
                        [`& .${alertTitleClasses.root}`]: { typography: 'titleSmall', mt: 0, mb: 0.5 },
                        [`& .${buttonClasses.root}`]: { color: 'm3.inversePrimary' },
                        [`& .${iconButtonClasses.root}`]: { color: 'm3.inverseOnSurface' },
                    }}
                    onClose={() => closeSnackbar(id)}
                >
                    <TitleComponent>{message}</TitleComponent>
                    {actualDescription}
                    {(isDescriptionTooLong || (isGraphqlException && graphqlStackTrace)) && (
                        <Button
                            onClick={() => {
                                Confirmation.show({
                                    title:
                                        typeof message === 'string'
                                            ? message
                                            : t(SNACKBAR_VARIANT_TO_TRANSLATION[variant]),
                                    message: description ?? '',
                                    actions: {
                                        cancel: { show: false },
                                        confirm: {
                                            title: t`Close`,
                                        },
                                    },
                                }).catch(
                                    defaultPromiseErrorHandler(
                                        `SnackbarWithDescription: ${id} - ${message} - ${description}`,
                                    ),
                                );
                            }}
                            size="small"
                        >
                            {t`Show more`}
                        </Button>
                    )}
                </Alert>
            </SnackbarContent>
        );
    },
);
