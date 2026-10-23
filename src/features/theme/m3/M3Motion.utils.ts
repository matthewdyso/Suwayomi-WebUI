/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { M3Spring } from '@/features/theme/m3/M3.types.ts';
import { M3_CSS_VARIABLE } from '@/features/theme/m3/M3Layout.constants.ts';

/**
 * Creates a CSS "transition" value that animates the properties with the spring; instant with reduced motion.
 */
export const m3Transition = (properties: string[], spring: M3Spring): string =>
    properties
        .map(
            (property) =>
                `${property} calc(${spring.duration}ms * var(${M3_CSS_VARIABLE.motionScale}, 1)) ${spring.easing}`,
        )
        .join(', ');
