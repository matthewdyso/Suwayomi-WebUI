/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import '@mui/material/styles';
import '@mui/material/Typography';
import '@mui/material/Button';
import type { CSSProperties } from 'react';
import type { M3Palette, M3TypographyVariant } from '@/features/theme/m3/M3.types.ts';

declare module '@mui/material/styles' {
    interface CssThemeVariables {
        enabled: true;
    }

    // Re-exported here because MUI doesn't include PaletteBackgroundChannel in its public API surface.
    // Defined in @mui/material/esm/styles/createThemeFoundation.d.ts
    export interface PaletteBackgroundChannel {
        defaultChannel: string;
        paperChannel: string;
    }

    interface Palette {
        m3: M3Palette;
    }

    interface PaletteOptions {
        m3?: M3Palette;
    }

    // Module augmentation only merges interfaces; their members come from the record of the M3 variant names.
    // oxlint-disable-next-line typescript/no-empty-object-type
    interface TypographyVariants extends Record<M3TypographyVariant, CSSProperties> {}

    // oxlint-disable-next-line typescript/no-empty-object-type
    interface TypographyVariantsOptions extends Partial<Record<M3TypographyVariant, CSSProperties>> {}
}

declare module '@mui/material/Typography' {
    // oxlint-disable-next-line typescript/no-empty-object-type
    interface TypographyPropsVariantOverrides extends Record<M3TypographyVariant, true> {}
}

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        tonal: true;
    }
}
