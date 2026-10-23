/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { StringParam, useQueryParam } from 'use-query-params';
import { useLingui } from '@lingui/react/macro';
import { PasswordTextField } from '@/base/components/inputs/PasswordTextField.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { SearchParam } from '@/base/Base.types.ts';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';
import { SuwayomiLogo } from '@/assets/SuwayomiLogo.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

export const LoginPage = () => {
    const theme = useTheme();
    const { t } = useLingui();
    const { setOverride } = useNavBarContext();
    const navigate = useNavigate();
    const isAuthenticated = AuthManager.useIsAuthenticated();

    const [redirect] = useQueryParam(SearchParam.REDIRECT, StringParam);
    const [loginUser, { loading: isLoading }] = requestManager.useLoginUser();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasLoginFailed, setHasLoginFailed] = useState(false);

    const doLogin = async () => {
        try {
            setHasLoginFailed(false);
            const { data } = await loginUser({ variables: { username, password } });

            if (data) {
                AuthManager.setTokens(data.login.accessToken, data.login.refreshToken);
                requestManager.processQueues();
                navigate(redirect ?? AppRoutes.root.path);
            }
        } catch (e) {
            setHasLoginFailed(true);
            makeToast(t`Could not log in to Suwayomi`, 'error', getErrorMessage(e));
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        doLogin().catch(defaultPromiseErrorHandler('LoginPage::doLogin'));
    };

    useEffect(() => {
        setOverride({ status: true, value: null });

        return () => setOverride({ status: false, value: null });
    }, []);

    if (isAuthenticated) {
        return <Navigate to={AppRoutes.root.path} replace />;
    }

    const isLoginDisabled = isLoading || (!username && !password);

    return (
        <Stack
            sx={{
                minHeight: '100vh',
                '@supports (min-height: 100dvh)': {
                    minHeight: '100dvh',
                },
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                px: 'calc(24px + env(safe-area-inset-left))',
                pt: 'calc(24px + env(safe-area-inset-top))',
                pb: 3,
                bgcolor: 'm3.surface',
            }}
        >
            <Stack
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{ width: '100%', maxWidth: 400, gap: 2, alignItems: 'stretch' }}
            >
                <SuwayomiLogo circleRingColor={theme.palette.m3.primary} sx={{ fontSize: 64, alignSelf: 'center' }} />
                {/* the app's name, not translated */}
                <Typography variant="headlineSmall" component="h1" sx={{ textAlign: 'center', mb: 1 }}>
                    Suwayomi
                </Typography>
                <TextField
                    autoFocus
                    id="username"
                    name="username"
                    autoComplete="username"
                    label={t`Username`}
                    type="text"
                    fullWidth
                    error={hasLoginFailed}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <PasswordTextField
                    fullWidth
                    autoComplete="current-password"
                    error={hasLoginFailed}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {hasLoginFailed && (
                    <Typography variant="bodySmall" role="alert" sx={{ color: 'm3.error' }}>
                        {t`Could not log in to Suwayomi`}
                    </Typography>
                )}
                <Button type="submit" disabled={isLoginDisabled} variant="contained" fullWidth>
                    {t`Log in`}
                </Button>
            </Stack>
            <Stack sx={{ width: '100%', maxWidth: 400 }}>
                <ServerAddressSetting />
            </Stack>
        </Stack>
    );
};
