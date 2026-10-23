/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import {
    updateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MutableListSetting } from '@/base/components/settings/MutableListSetting.tsx';
import { useDeviceContext } from '@/features/device/DeviceContext.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { DEFAULT_DEVICE } from '@/features/device/services/Device.ts';
import type { MetadataServerSettingKeys, MetadataServerSettings } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { PreferenceList } from '@/features/settings/components/PreferenceList.tsx';
import { SelectPreference } from '@/features/settings/components/SelectPreference.tsx';

export const DeviceSetting = () => {
    const { t } = useLingui();

    useAppTitle(t`Device`);

    const {
        metadata,
        settings: { devices },
        loading,
        request: { error, refetch },
    } = useMetadataServerSettings();

    const { activeDevice, setActiveDevice } = useDeviceContext();

    const updateMetadataSetting = <Setting extends MetadataServerSettingKeys>(
        setting: Setting,
        value: MetadataServerSettings[Setting],
    ) => {
        if (!metadata) {
            return;
        }

        const wasActiveDeviceDeleted = setting === 'devices' && !(value as string[]).includes(activeDevice);
        if (wasActiveDeviceDeleted) {
            setActiveDevice(DEFAULT_DEVICE);
        }

        updateMetadataServerSettings(setting, value).catch((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DeviceSetting::refetch'))}
            />
        );
    }

    return (
        <PreferenceList>
            <MutableListSetting
                settingName={t`Devices`}
                description={t`Manage your existing devices.\nUI specific settings that are stored on the server are per device.\nThis makes it possible to have e.g. different settings on a desktop and a smartphone`}
                handleChange={(deviceList) => {
                    updateMetadataSetting('devices', [
                        ...new Set([DEFAULT_DEVICE, ...deviceList].filter((device) => device !== t`Default`)),
                    ]);
                }}
                valueInfos={devices.map((device) => [
                    device === DEFAULT_DEVICE ? t`Default` : device,
                    { mutable: false, deletable: device !== DEFAULT_DEVICE },
                ])}
                addItemButtonTitle={t`Create`}
                validateItem={(device) => device.length <= 16 && !!device.match(/^[a-zA-Z0-9\-_]+$/g)}
                placeholder={t`Smartphone_Name-1 | length: 16, chars: letters, numbers, -, _`}
            />
            <SelectPreference
                title={t`Active device`}
                description={t`Select a device to use its server stored UI settings`}
                value={activeDevice}
                options={devices.map((device) => ({
                    value: device,
                    label: device === DEFAULT_DEVICE ? t`Default` : device,
                }))}
                onChange={setActiveDevice}
            />
        </PreferenceList>
    );
};
