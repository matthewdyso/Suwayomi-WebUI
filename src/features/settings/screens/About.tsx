/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import GitHubIcon from '@mui/icons-material/GitHub';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { UpdateState } from '@/lib/graphql/generated/graphql-base.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { VersionInfo } from '@/features/app-updates/components/VersionInfo.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { epochToDate } from '@/base/utils/DateHelper.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { DebugInformation } from '@/features/settings/components/DebugInformation.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { DiscordIcon } from '@/assets/icons/svg/DiscordIcon.tsx';
import { getServerChangelogUrl, getWebUIChangelogUrl } from '@/features/app-updates/AppUpdates.utils.ts';
import { PreferenceList } from '@/features/settings/components/PreferenceList.tsx';
import { LogoHeader } from '@/features/settings/components/LogoHeader.tsx';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';

const WEBUI_GITHUB_URL = 'https://github.com/Suwayomi/Suwayomi-WebUI';

export function About() {
    const { t } = useLingui();

    useAppTitle(t`About`);

    const { data, loading, error, refetch } = requestManager.useGetAbout();

    const {
        data: serverUpdateCheckData,
        loading: isCheckingForServerUpdate,
        refetch: checkForServerUpdate,
        error: serverUpdateCheckError,
    } = requestManager.useCheckForServerUpdate();
    const {
        data: webUIUpdateData,
        loading: isCheckingForWebUIUpdate,
        refetch: checkForWebUIUpdate,
        error: orgWebUIUpdateCheckError,
    } = requestManager.useCheckForWebUIUpdate();
    const webUIUpdateCheckError = orgWebUIUpdateCheckError || webUIUpdateData?.checkForWebUIUpdate.tag === '';

    const { data: webUIUpdateStatusData } = requestManager.useGetWebUIUpdateStatus();
    const { state: webUIUpdateState, progress: webUIUpdateProgress } = webUIUpdateStatusData?.getWebUIUpdateStatus ?? {
        state: UpdateState.Idle,
        progress: 0,
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('About::refetch'))}
            />
        );
    }

    const { aboutServer, aboutWebUI } = data!;
    const selectedServerChannelInfo = serverUpdateCheckData?.checkForServerUpdates?.find(
        (channel) => channel.channel === aboutServer.buildType,
    );
    const isServerUpdateAvailable =
        !!selectedServerChannelInfo?.tag && selectedServerChannelInfo.tag !== aboutServer.version;
    const isWebUIUpdateAvailable = !!webUIUpdateData?.checkForWebUIUpdate.updateAvailable;

    // Like Mihon, a row only checks for an update; installing one (which replaces the served WebUI) needs a confirmation
    const confirmWebUIUpdate = () =>
        Confirmation.show({
            title: t`Update available`,
            message: t`WebUI version ${webUIUpdateData?.checkForWebUIUpdate.tag} (${webUIUpdateData?.checkForWebUIUpdate.channel}) available for download`,
            actions: { confirm: { title: t`Update` } },
        })
            .then(() => requestManager.updateWebUI().response)
            // also rejected when the confirmation is cancelled
            .catch(defaultPromiseErrorHandler('About::updateWebUI'));

    // the WebUI's repository has its own row, so the icons, which touch screens show without a tooltip, stay unambiguous
    const links = [
        { title: t`GitHub Server`, url: aboutServer.github, icon: <GitHubIcon /> },
        { title: t`Discord`, url: aboutServer.discord, icon: <DiscordIcon /> },
    ];

    return (
        <>
            <LogoHeader paddingY={56} />
            <PreferenceList>
                <List
                    subheader={
                        <ListSubheader component="div" id="about-server-info">
                            {t`Server`}
                        </ListSubheader>
                    }
                >
                    <ListItem>
                        <ListItemText
                            primary={t`Server`}
                            secondary={`${aboutServer.name} (${aboutServer.buildType})`}
                        />
                    </ListItem>
                    <VersionInfo
                        title={t`Server version`}
                        version={aboutServer.version}
                        isCheckingForUpdate={isCheckingForServerUpdate}
                        isUpdateAvailable={isServerUpdateAvailable}
                        updateCheckError={serverUpdateCheckError}
                        checkForUpdate={checkForServerUpdate}
                        downloadAsLink
                        url={selectedServerChannelInfo?.url ?? ''}
                    />
                    <ListItem>
                        <ListItemText
                            primary={t`Build time`}
                            secondary={epochToDate(Number(aboutServer.buildTime)).toString()}
                        />
                    </ListItem>
                    <ListItemLink
                        to={getServerChangelogUrl(aboutServer.buildType, aboutServer.version)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ListItemText primary={t`Changelog`} />
                    </ListItemLink>
                </List>
                <List
                    subheader={
                        <ListSubheader component="div" id="about-webui-info">
                            {t`WebUI`}
                        </ListSubheader>
                    }
                >
                    <ListItem>
                        <ListItemText primary={t`WebUI channel`} secondary={aboutWebUI.channel.toLocaleUpperCase()} />
                    </ListItem>
                    <VersionInfo
                        title={t`WebUI version`}
                        version={aboutWebUI.tag}
                        isCheckingForUpdate={isCheckingForWebUIUpdate}
                        isUpdateAvailable={isWebUIUpdateAvailable}
                        updateCheckError={webUIUpdateCheckError}
                        checkForUpdate={checkForWebUIUpdate}
                        triggerUpdate={confirmWebUIUpdate}
                        progress={webUIUpdateProgress}
                        updateState={webUIUpdateState}
                    />
                    <ListItemLink to={getWebUIChangelogUrl(aboutWebUI.channel)} target="_blank" rel="noreferrer">
                        <ListItemText primary={t`Changelog`} />
                    </ListItemLink>
                    <ListItemLink to={WEBUI_GITHUB_URL} target="_blank" rel="noreferrer">
                        <ListItemText primary={t`GitHub WebUI`} secondary={WEBUI_GITHUB_URL} />
                    </ListItemLink>
                </List>
                <List
                    subheader={
                        <ListSubheader component="div" id="about-debug-info">
                            {t`Debug information`}
                        </ListSubheader>
                    }
                >
                    <Stack sx={{ px: 2, py: 1 }}>
                        <DebugInformation />
                    </Stack>
                </List>
            </PreferenceList>
            <Stack component="nav" aria-label={t`Links`} sx={{ flexDirection: 'row', justifyContent: 'center', py: 1 }}>
                {links.map(({ title, url, icon }) => (
                    <CustomTooltip key={title} title={title}>
                        {/* Mihon's LinkIcon: primary tint, 4dp around each button */}
                        <IconButton
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={title}
                            sx={{ color: 'm3.primary', m: 0.5 }}
                        >
                            {icon}
                        </IconButton>
                    </CustomTooltip>
                ))}
            </Stack>
        </>
    );
}
