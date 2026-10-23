/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import DragHandleRounded from '@mui/icons-material/DragHandleRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListRow } from '@/base/components/lists/ListRow.tsx';
import type { CategoryIdInfo, CategoryNameInfo } from '@/features/category/Category.types.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

/**
 * Mihon's "CategoryListItem": an elevated card, the whole card is draggable, a tap renames the category.
 */
export const CategorySettingsCard = ({
    category,
    onEdit,
    lifted = false,
}: {
    category: CategoryIdInfo & CategoryNameInfo;
    onEdit: () => void;
    /**
     * The card while it's dragged.
     */
    lifted?: boolean;
}) => {
    const { t } = useLingui();

    const deleteCategory = () =>
        Confirmation.show({
            title: t`Are you sure?`,
            message: t`You are about to delete category "${category.name}"`,
        })
            .then(() =>
                requestManager
                    .deleteCategory(category.id)
                    .response.catch((e) => makeToast(t`Could not delete category`, 'error', getErrorMessage(e))),
            )
            // rejected when the confirmation is cancelled
            .catch(defaultPromiseErrorHandler('CategorySettingsCard::deleteCategory'));

    return (
        <Card sx={{ boxShadow: lifted ? 3 : 1 }}>
            <ListRow
                // Mihon's 16 px padding around the drag handle sets the 72 px row height
                leading={
                    <Box sx={{ display: 'flex', p: 2 }}>
                        <DragHandleRounded />
                    </Box>
                }
                headline={category.name}
                onClick={onEdit}
                // Mihon: 8 px start, 16 px end, no gaps between the handle, the name and the buttons
                sx={{ pl: 1, pr: 2, gap: 0 }}
                trailing={
                    <Stack sx={{ flexDirection: 'row' }}>
                        <CustomTooltip title={t`Edit`}>
                            <IconButton onClick={onEdit}>
                                <EditRounded />
                            </IconButton>
                        </CustomTooltip>
                        <CustomTooltip title={t`Delete`}>
                            <IconButton onClick={deleteCategory}>
                                <DeleteRounded />
                            </IconButton>
                        </CustomTooltip>
                    </Stack>
                }
            />
        </Card>
    );
};
