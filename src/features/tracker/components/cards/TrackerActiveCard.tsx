/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ButtonBase from '@mui/material/ButtonBase';
import { listItemButtonClasses } from '@mui/material/ListItemButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PopupState, { bindDialog, bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useMemo, useState } from 'react';
import Badge from '@mui/material/Badge';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { ListPreference } from '@/features/source/configuration/components/ListPreference.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { DateSetting } from '@/base/components/settings/DateSetting.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { Menu } from '@/base/components/menu/Menu.tsx';
import { UNSET_DATE } from '@/features/tracker/Tracker.constants.ts';
import type { SelectSettingValue } from '@/base/components/settings/SelectSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import type { TrackRecordType } from '@/lib/graphql/generated/graphql-base.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import type { TTrackerBind, TTrackRecordBind } from '@/features/tracker/Tracker.types.ts';
import { TrackerLogo } from '@/features/tracker/components/TrackerLogo.tsx';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';

const TrackerActiveLink = ({ children, url }: { children: React.ReactNode; url: string }) => (
    <Link href={url} rel="noreferrer" target="_blank" underline="none" color="inherit">
        {children}
    </Link>
);

type TTrackerActive = Pick<TTrackerBind, 'id' | 'name' | 'icon' | 'supportsTrackDeletion' | 'supportsPrivateTracking'>;
const TrackerActiveRemoveBind = ({
    trackerRecordId,
    tracker,
    onClick,
    onClose,
}: {
    trackerRecordId: TrackRecordType['id'];
    tracker: TTrackerActive;
    onClick: () => void;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    const [removeRemoteTracking, setRemoveRemoteTracking] = useState(false);

    const removeBind = () => {
        onClose();
        requestManager
            .unbindTracker(trackerRecordId, removeRemoteTracking)
            .response.then(() => makeToast(t`Untracked manga`, 'success'))
            .catch((e) => makeToast(t`Could not untrack manga`, 'error', getErrorMessage(e)));
    };

    return (
        <PopupState variant="dialog" popupId={`tracker-active-menu-remove-button-${tracker.id}`}>
            {(popupState) => (
                <>
                    <MenuItem
                        {...bindTrigger(popupState)}
                        onClick={() => {
                            onClick();
                            popupState.open();
                        }}
                    >
                        {t`Remove`}
                    </MenuItem>
                    <Dialog
                        {...bindDialog(popupState)}
                        onClose={() => {
                            onClose();
                            popupState.close();
                        }}
                    >
                        <DialogTitle>{t`Remove ${tracker.name} tracking?`}</DialogTitle>
                        <DialogContent dividers>
                            <Typography>{t`This will remove the tracking locally.`}</Typography>
                            {tracker.supportsTrackDeletion && (
                                <FormGroup>
                                    <CheckboxInput
                                        disabled={false}
                                        label={t`Also remove from ${tracker.name}`}
                                        checked={removeRemoteTracking}
                                        onChange={(_, checked) => setRemoveRemoteTracking(checked)}
                                    />
                                </FormGroup>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                autoFocus
                                onClick={() => {
                                    popupState.close();
                                    onClose();
                                }}
                            >
                                {t`Cancel`}
                            </Button>
                            <Button
                                onClick={() => {
                                    popupState.close();
                                    onClose();
                                    removeBind();
                                }}
                            >
                                {t`Ok`}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </PopupState>
    );
};

const TrackerUpdatePrivateStatus = ({
    trackRecordId,
    isPrivate,
    closeMenu,
    supportsPrivateTracking,
}: {
    trackRecordId: TrackRecordType['id'];
    isPrivate: boolean;
    closeMenu: () => void;
    supportsPrivateTracking: TTrackerActive['supportsPrivateTracking'];
}) => {
    const { t } = useLingui();

    if (!supportsPrivateTracking) {
        return null;
    }

    return (
        <MenuItem
            onClick={() => {
                requestManager
                    .updateTrackerBind(trackRecordId, { private: !isPrivate })
                    .response.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));
                closeMenu();
            }}
        >
            {isPrivate ? t`Track publicly` : t`Track privately`}
        </MenuItem>
    );
};

type TTrackRecordActive = Pick<TTrackRecordBind, 'id' | 'remoteUrl' | 'title' | 'private'>;
const TrackerActiveHeader = ({
    trackRecord,
    tracker,
    openSearch,
}: {
    trackRecord: TTrackRecordActive;
    tracker: TTrackerActive;
    openSearch: () => void;
}) => {
    const { t } = useLingui();

    return (
        <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Badge
                badgeContent={
                    trackRecord.private ? (
                        <VisibilityOffRoundedIcon aria-label={t`Track privately`} sx={{ fontSize: 14 }} />
                    ) : null
                }
                slotProps={{ badge: { sx: { bgcolor: 'm3.primary', color: 'm3.onPrimary' } } }}
            >
                <TrackerActiveLink url={trackRecord.remoteUrl}>
                    <TrackerLogo name={tracker.name} icon={tracker.icon} />
                </TrackerActiveLink>
            </Badge>
            <ButtonBase
                onClick={openSearch}
                sx={{ flex: '1 1 0', minWidth: 0, height: 48, justifyContent: 'flex-start', pl: 2, pr: 1 }}
            >
                <CustomTooltip title={trackRecord.title}>
                    <Typography variant="titleMedium" noWrap sx={{ color: 'm3.onSurface' }}>
                        {trackRecord.title}
                    </Typography>
                </CustomTooltip>
            </ButtonBase>
            <Divider orientation="vertical" flexItem />
            <Stack
                sx={{
                    justifyContent: 'center',
                }}
            >
                <PopupState variant="popover" popupId={`tracker-active-menu-popup-${tracker.id}`}>
                    {(popupState) => (
                        <>
                            <IconButton {...bindTrigger(popupState)} aria-label={t`More`}>
                                <MoreVertRoundedIcon />
                            </IconButton>
                            <Menu {...bindMenu(popupState)} id={`tracker-active-menu-${tracker.id}`}>
                                {(onClose, setHideMenu) => [
                                    <TrackerActiveLink
                                        key={`tracker-active-menu-item-browser-${tracker.id}`}
                                        url={trackRecord.remoteUrl}
                                    >
                                        <MenuItem onClick={() => onClose()}>{t`Open in browser`}</MenuItem>
                                    </TrackerActiveLink>,
                                    <TrackerActiveRemoveBind
                                        key={`tracker-active-menu-item-remove-${tracker.id}`}
                                        trackerRecordId={trackRecord.id}
                                        tracker={tracker}
                                        onClick={() => setHideMenu(true)}
                                        onClose={onClose}
                                    />,
                                    <TrackerUpdatePrivateStatus
                                        key={`tracker-active-menu-item-private-${tracker.id}`}
                                        trackRecordId={trackRecord.id}
                                        isPrivate={trackRecord.private}
                                        closeMenu={onClose}
                                        supportsPrivateTracking={tracker.supportsPrivateTracking}
                                    />,
                                ]}
                            </Menu>
                        </>
                    )}
                </PopupState>
            </Stack>
        </Stack>
    );
};

/**
 * Mihon clips the track details inside the card's padding to 6 dp, which rounds the outer buttons' state layers.
 */
const TRACK_DETAILS_RADIUS = '6px';

/**
 * A row of Mihon's track details: equally wide, centered text buttons between dividers.
 */
const TrackerActiveCardInfoRow = ({ children }: { children: React.ReactNode }) => (
    <Stack
        direction="row"
        sx={{
            [`& > .${listItemButtonClasses.root}`]: {
                flex: '1 1 0',
                minWidth: 0,
                textAlign: 'center',
            },
        }}
    >
        {children}
    </Stack>
);

const isUnsetScore = (score: string | number): boolean => !Math.trunc(Number(score));

export const TrackerActiveCard = ({
    trackRecord,
    tracker,
    onClick,
}: {
    trackRecord: TTrackRecordBind;
    tracker: TTrackerBind;
    onClick: () => void;
}) => {
    const { t } = useLingui();

    const isScoreUnset = isUnsetScore(trackRecord.displayScore);
    const currentScore = isScoreUnset ? tracker.scores[0] : trackRecord.displayScore;

    const selectSettingValues = useMemo(
        () =>
            tracker.scores.map(
                (score) =>
                    [score, { text: isUnsetScore(score) ? '-' : score }] satisfies SelectSettingValue<
                        TTrackerBind['scores'][number]
                    >,
            ),
        [tracker.scores],
    );

    const updateTrackerBind = (patch: Parameters<typeof requestManager.updateTrackerBind>[1]) => {
        requestManager
            .updateTrackerBind(trackRecord.id, patch)
            .response.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));
    };

    return (
        <Box>
            <TrackerActiveHeader trackRecord={trackRecord} tracker={tracker} openSearch={onClick} />
            {/* Mihon's track details card; one step above the sheet's surfaceContainerHigh */}
            <Box sx={{ mt: 1.5, p: 1, borderRadius: M3_SHAPE.medium, bgcolor: 'm3.surfaceContainerHighest' }}>
                <Box sx={{ borderRadius: TRACK_DETAILS_RADIUS, overflow: 'hidden' }}>
                    <TrackerActiveCardInfoRow>
                        <ListPreference
                            ListPreferenceTitle={t`Status`}
                            entries={tracker.statuses.map((status) => status.name)}
                            key="status"
                            type="ListPreference"
                            entryValues={tracker.statuses.map((status) => `${status.value}`)}
                            ListPreferenceCurrentValue={`${trackRecord.status}`}
                            ListPreferenceDefault={null}
                            updateValue={(_, status) => updateTrackerBind({ status: Number(status) })}
                            summary="%s"
                        />
                        <Divider orientation="vertical" flexItem />
                        <NumberSetting
                            settingTitle={t`Chapter`}
                            dialogTitle={t`Chapter`}
                            settingValue={`${trackRecord.lastChapterRead}/${trackRecord.totalChapters}`}
                            value={trackRecord.lastChapterRead}
                            minValue={0}
                            maxValue={Number.MAX_SAFE_INTEGER}
                            valueUnit=""
                            handleUpdate={(lastChapterRead) => updateTrackerBind({ lastChapterRead })}
                        />
                        <Divider orientation="vertical" flexItem />
                        <SelectSetting<string>
                            settingName={t`Score`}
                            value={currentScore}
                            values={selectSettingValues}
                            handleChange={(score) => updateTrackerBind({ scoreString: score })}
                        />
                    </TrackerActiveCardInfoRow>
                    <Divider />
                    <TrackerActiveCardInfoRow>
                        <DateSetting
                            settingName={t`Start date`}
                            value={Trackers.getDateString(trackRecord.startDate)}
                            remove
                            handleChange={(startDate) => updateTrackerBind({ startDate: startDate ?? UNSET_DATE })}
                        />
                        <Divider orientation="vertical" flexItem />
                        <DateSetting
                            settingName={t`Finish date`}
                            value={Trackers.getDateString(trackRecord.finishDate)}
                            remove
                            handleChange={(finishDate) => updateTrackerBind({ finishDate: finishDate ?? UNSET_DATE })}
                        />
                    </TrackerActiveCardInfoRow>
                </Box>
            </Box>
        </Box>
    );
};
