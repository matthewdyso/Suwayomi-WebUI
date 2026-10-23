/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import type { MangaIdInfo, MangaMetaInfo } from '@/features/manga/Manga.types.ts';
import { updateMangaMetadata, useGetMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';
import { getErrorMessage, markdownToSafeHtml } from '@/lib/HelperFunctions.ts';
import StarterKit from '@tiptap/starter-kit';
import {
    MenuButton,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRedo,
    MenuButtonUndo,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    type RichTextEditorRef,
} from 'mui-tiptap';
import { Markdown } from '@tiptap/markdown';
import { Placeholder } from '@tiptap/extension-placeholder';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClearContentShortcut, SaveContentShortcut } from '@/lib/mui-tiptap/MuiTipTap.shortcut.util.ts';
import { MarkdownViewer } from '@/lib/mui-tiptap/MarkdownViewer.tsx';
import Typography from '@mui/material/Typography';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { M3_SHAPE } from '@/features/theme/m3/M3Shape.constants.ts';
import type { SxProps, Theme } from '@mui/material/styles';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

const MangaNotesEditor = ({
    manga,
    notes,
    onClose,
}: {
    manga: MangaIdInfo & MangaMetaInfo;
    notes: string;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    const rteRef = useRef<RichTextEditorRef>(null);

    const [draft, setDraft] = useState(notes);

    const hasNotes = notes.trim().length > 0;
    const isUnchanged = draft.trimEnd() === notes;

    const saveNotes = (content: string) => {
        const nextNotes = content.trimEnd();

        void updateMangaMetadata(manga, 'notes', nextNotes)
            .then(() => {
                makeToast(t`Notes saved`, 'success');
                onClose();
            })
            .catch((error) => makeToast(t`Could not save notes`, 'error', getErrorMessage(error)));
    };

    return (
        <>
            <DialogTitle>{hasNotes ? t`Edit notes` : t`Add notes`}</DialogTitle>
            <DialogContent>
                <RichTextEditor
                    ref={rteRef}
                    extensions={[
                        StarterKit,
                        Markdown,
                        Placeholder.configure({
                            placeholder: t`Add a private note about this manga`,
                        }),
                        ClearContentShortcut.extension,
                        SaveContentShortcut((editor, unchangedContent) => {
                            if (unchangedContent) {
                                onClose();
                                return true;
                            }

                            saveNotes(editor.getMarkdown());

                            return true;
                        }).extension,
                    ]}
                    content={markdownToSafeHtml(notes.trim())}
                    contentType="markdown"
                    onUpdate={({ editor }) => {
                        setDraft(editor.getMarkdown());
                    }}
                    renderControls={() => (
                        <MenuControlsContainer>
                            <MenuButtonUndo />
                            <MenuButtonRedo />
                            <MenuDivider />
                            <MenuSelectHeading />
                            <MenuDivider />
                            <MenuButtonBold />
                            <MenuButtonItalic />
                            <MenuButtonBulletedList />
                            <MenuButtonOrderedList />
                            <MenuDivider />
                            <MenuButton
                                tooltipLabel={t`Clear notes`}
                                onClick={() => rteRef.current?.editor?.chain().focus().clearContent().run()}
                                tooltipShortcutKeys={ClearContentShortcut.tooltipKeys}
                            >
                                <DeleteIcon color="inherit" />
                            </MenuButton>
                        </MenuControlsContainer>
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t`Cancel`}</Button>
                <Button onClick={() => saveNotes(draft)} disabled={isUnchanged} variant="contained">
                    {t`Save`}
                </Button>
            </DialogActions>
        </>
    );
};

/**
 * The editor mounts with each opening, so it always starts from the saved notes.
 */
export const MangaNotesDialog = ({
    manga,
    open,
    onClose,
}: {
    manga: MangaIdInfo & MangaMetaInfo;
    open: boolean;
    onClose: () => void;
}) => {
    const { notes } = useGetMangaMetadata(manga);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <MangaNotesEditor manga={manga} notes={notes} onClose={onClose} />
        </Dialog>
    );
};

/**
 * The manga's private notes above its description; adding notes is in the toolbar menu (Mihon).
 */
export const MangaNotes = ({ manga, sx }: { manga: MangaIdInfo & MangaMetaInfo; sx?: SxProps<Theme> }) => {
    const { t } = useLingui();
    const popupState = usePopupState({ variant: 'dialog', popupId: 'manga-notes-dialog' });

    const { notes } = useGetMangaMetadata(manga);
    const hasNotes = notes.trim().length > 0;

    if (!hasNotes) {
        return null;
    }

    return (
        <Box sx={MUIUtil.mergeSx({ bgcolor: 'm3.surfaceContainerHigh', borderRadius: M3_SHAPE.medium, p: 1.5 }, sx)}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="titleSmall" component="h3">
                    {t`Notes`}
                </Typography>
                <Button size="small" variant="text" startIcon={<EditNoteRoundedIcon />} {...bindTrigger(popupState)}>
                    {t`Edit`}
                </Button>
            </Stack>
            <MarkdownViewer markdown={notes.trim()} />
            <MangaNotesDialog manga={manga} open={popupState.isOpen} onClose={popupState.close} />
        </Box>
    );
};
