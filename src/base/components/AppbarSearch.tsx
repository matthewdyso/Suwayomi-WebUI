/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useMemo, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { useQueryParam, StringParam } from 'use-query-params';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { SearchTextField } from '@/base/components/inputs/SearchTextField.tsx';
import { SearchParam } from '@/base/Base.types.ts';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useDebounce } from '@/base/hooks/useDebounce.ts';
import { createFuzzySearch, fuzzySearch } from '@/base/utils/FuzzySearch.ts';
import { enhancedCleanup, escapeRegex } from '@/base/utils/Strings.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useSearchHistory } from '@/base/hooks/useSearchHistory.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { useForceUpdate } from '@mantine/hooks';
import List from '@mui/material/List';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import Button from '@mui/material/Button';
import { OffsetContainer } from '@/base/OffsetComponent.tsx';
import { inputBaseClasses } from '@mui/material/InputBase';
import { useMainRoutePath } from '@/features/navigation-bar/hooks/useMainRoutePath.ts';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { SECONDARY_ALPHA } from '@/features/theme/m3/M3Color.constants.ts';

/** Enough to be worth scrolling through, few enough to not cover the whole screen on mobile. */
const MAX_SUGGESTIONS = 8;

/** Short enough to still feel immediate, long enough to rank a large library only once per pause in the typing. */
const SUGGESTION_DEBOUNCE_MS = 150;

const MAX_HISTORY_SUGGESTIONS = 5;

/**
 * Mihon's search field text: titleMedium at 18 px, regular weight.
 */
const SEARCH_FIELD_FONT = {
    fontSize: '1.125rem',
    fontWeight: 400,
} as const;

type SearchSuggestion = {
    label: string;
    isFromHistory: boolean;
};

const getSubstringMatches = (query: string, suggestions: string[]): string[] =>
    suggestions.filter((suggestion) => enhancedCleanup(suggestion).includes(query));

interface IProps {
    searchHistoryKey: string;
    isClosable?: boolean;
    suggestions?: string[];
}

export const AppbarSearch: React.FunctionComponent<IProps> = (props) => {
    const { searchHistoryKey, isClosable = true, suggestions = STABLE_EMPTY_ARRAY } = props;

    const theme = useTheme();
    const { t } = useLingui();
    const { setHideTitle, navBarWidth } = useNavBarContext();
    const getOptionForDirection = useGetOptionForDirection();
    const isMainRoute = useMainRoutePath() !== null;
    // without a navigation icon in the app bar, the search gets its own close arrow in front of the field (Mihon)
    const showCloseArrow = isClosable && isMainRoute;
    const scrollbarYSize = MediaQuery.useGetScrollbarSize('Y');
    const forceUpdate = useForceUpdate();

    const [prevLocationKey, setPrevLocationKey] = useState<string>();
    const location = useLocation();

    const [query, setQuery] = useQueryParam(SearchParam.QUERY, StringParam);
    const [isSearchOpen, setIsSearchOpen] = useState(!isClosable || !!query);
    const inputRef = React.useRef<HTMLInputElement>(undefined);

    const [searchString, setSearchString] = useState(query ?? '');
    const [liveAutoCompletion, setLiveAutoCompletion] = useState<string>();

    const [focused, setFocused] = useState(false);
    const [hideSuggestions, setHideSuggestions] = useState(isSearchOpen);

    const {
        settings: { fuzzySearch: isFuzzySearchEnabled },
    } = useMetadataServerSettings();

    const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory(
        searchHistoryKey,
        MAX_HISTORY_SUGGESTIONS,
    );

    if (prevLocationKey !== location.key) {
        setPrevLocationKey(location.key);
        setSearchString(query ?? '');
        setIsSearchOpen(!isClosable || !!query);
    }

    const isOpen = isSearchOpen || !!query;

    const debouncedSearchString = useDebounce(searchString, SUGGESTION_DEBOUNCE_MS).trim();
    const showHistoryOptions = !debouncedSearchString;

    const fuzzySearchIndex = useMemo(
        () => (isOpen && isFuzzySearchEnabled ? createFuzzySearch(suggestions, []) : null),
        [isOpen, isFuzzySearchEnabled, suggestions],
    );

    const { historyOptions, suggestionOptions } = useMemo(() => {
        const matches = fuzzySearchIndex
            ? fuzzySearch(fuzzySearchIndex, debouncedSearchString, { limit: MAX_SUGGESTIONS })
            : getSubstringMatches(enhancedCleanup(debouncedSearchString), suggestions);

        return {
            historyOptions: history.map((label) => ({ label, isFromHistory: true })),
            suggestionOptions: [...new Set(matches)]
                .slice(0, MAX_SUGGESTIONS)
                .map((label) => ({ label, isFromHistory: false })),
        };
    }, [debouncedSearchString, fuzzySearchIndex, suggestions, history]);

    const updateSearchOpenState = (open: boolean) => {
        if (!isClosable && !open) {
            return;
        }

        setIsSearchOpen(open);

        // try to focus input component since in case of navigating to the previous/next page in the browser history
        // the "openSearch" state might not change and thus, won't trigger a focus
        if (open) {
            inputRef.current?.focus();
        }
    };

    function handleChange(newQuery: string) {
        const normalizedQuery = newQuery.trim();

        if (normalizedQuery === '') {
            return;
        }

        setLiveAutoCompletion(undefined);
        setSearchString(normalizedQuery);
        addToHistory(normalizedQuery);
        setQuery(normalizedQuery);
        updateSearchOpenState(false);
        setHideSuggestions(true);
    }

    const cancelSearch = () => {
        setLiveAutoCompletion(undefined);
        setSearchString('');
        setQuery(undefined);
        updateSearchOpenState(false);
        setHideSuggestions(false);
    };
    const handleBlur = () => {
        if (!searchString) {
            updateSearchOpenState(false);
        }
    };

    useHotkeys(
        'ctrl+f, F3',
        () => {
            updateSearchOpenState(true);
        },
        { preventDefault: true },
    );
    useHotkeys(
        'tab',
        (e) => {
            if (!focused || !liveAutoCompletion || liveAutoCompletion === searchString) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            setSearchString(liveAutoCompletion);
        },
        {
            enableOnFormTags: true,
        },
        [focused, liveAutoCompletion, searchString],
    );

    useEffect(() => {
        if (isOpen) {
            requestAnimationFrame(() => {
                forceUpdate();
            });
        }

        setHideTitle(isOpen);
        return () => {
            setHideTitle(false);
        };
    }, [isOpen]);

    if (isOpen) {
        return (
            <Autocomplete<SearchSuggestion, false, true, true>
                open={focused && !hideSuggestions}
                freeSolo
                disableClearable
                forcePopupIcon={false}
                openOnFocus
                fullWidth
                onKeyDown={() => {
                    if (hideSuggestions) {
                        setHideSuggestions(false);
                    }
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                    setFocused(false);
                    setHideSuggestions(false);
                }}
                slotProps={{
                    popper: {
                        placement: 'bottom-start',
                        sx: {
                            [theme.breakpoints.down('md')]: {
                                width: `calc(100vw - ${navBarWidth}px - ${scrollbarYSize}px) !important`,
                            },
                        },
                    },
                }}
                options={showHistoryOptions ? historyOptions : suggestionOptions}
                // the options are already ranked by relevance, re-filtering them would drop the typo tolerant hits
                filterOptions={(unfilteredOptions) => unfilteredOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                groupBy={(option) => (option.isFromHistory ? t`Recent searches` : '')}
                inputValue={searchString}
                onInputChange={(_, value, reason) => {
                    // "reset" fires on mount and after selecting an option, both of which would overwrite the state
                    // that is kept in sync with the query param
                    if (reason === 'input') {
                        setSearchString(value);
                        setHideSuggestions(false);

                        const tmpNormalizedValue = value.trimStart().toLowerCase();

                        if (!tmpNormalizedValue) {
                            setLiveAutoCompletion(undefined);
                            return;
                        }

                        const findLiveAutoCompletion = (list: string[]) =>
                            list.find((item) => item.toLowerCase().startsWith(tmpNormalizedValue));

                        const liveAutoCompletionString =
                            findLiveAutoCompletion(suggestionOptions.map(({ label }) => label)) ??
                            findLiveAutoCompletion(suggestions);
                        setLiveAutoCompletion(liveAutoCompletionString);
                    }
                }}
                onChange={(_, value) => {
                    handleChange(typeof value === 'string' ? value : value.label);
                }}
                renderGroup={(value) => (
                    <OffsetContainer initial>
                        <List
                            subheader={
                                value.group && (
                                    <ListSubheader sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {value.group}
                                        <Button onClick={clearHistory}>{t`Delete all`}</Button>
                                    </ListSubheader>
                                )
                            }
                        >
                            {value.children}
                        </List>
                    </OffsetContainer>
                )}
                renderOption={({ key, ...optionProps }, option) => (
                    <Box key={key} component="li" sx={{ gap: 1 }} {...optionProps}>
                        {option.isFromHistory ? <HistoryRoundedIcon /> : <SearchRoundedIcon />}
                        <Box sx={{ flexGrow: 1 }}>
                            <CustomTooltip title={option.label} placement="right">
                                <TypographyMaxLines sx={{ width: 'fit-content' }}>{option.label}</TypographyMaxLines>
                            </CustomTooltip>
                        </Box>
                        {option.isFromHistory && (
                            <CustomTooltip title={t`Delete`} placement="auto">
                                <IconButton
                                    edge="end"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromHistory(option.label);
                                    }}
                                >
                                    <CloseRoundedIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                    </Box>
                )}
                renderInput={(params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {showCloseArrow && (
                            <IconButton aria-label={t`Close`} onClick={cancelSearch} color="inherit">
                                {getOptionForDirection(<ArrowBackRoundedIcon />, <ArrowForwardRoundedIcon />)}
                            </IconButton>
                        )}
                        <Box sx={{ position: 'relative', flexGrow: 1, minWidth: 0, ml: showCloseArrow ? 0.5 : 0 }}>
                            {focused && liveAutoCompletion && (
                                <Box
                                    sx={{
                                        ...SEARCH_FIELD_FONT,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        height: '100%',
                                        width: '100%',
                                        overflow: 'hidden',
                                        color: 'text.secondary',
                                        whiteSpace: 'pre',
                                        pointerEvents: 'none',
                                        zIndex: 0,
                                    }}
                                >
                                    <Box component="span" sx={{ visibility: 'hidden' }}>
                                        {searchString}
                                    </Box>
                                    {liveAutoCompletion.replace(
                                        new RegExp(escapeRegex(searchString).trimStart(), 'i'),
                                        '',
                                    )}
                                </Box>
                            )}
                            <SearchTextField
                                {...params}
                                slotProps={{
                                    ...params.slotProps,
                                    input: { ...params.slotProps.input, disableUnderline: true },
                                }}
                                placeholder={t`Search`}
                                onClick={() => setHideSuggestions(false)}
                                autoFocus
                                variant="standard"
                                fullWidth
                                onCancel={cancelSearch}
                                onBlur={handleBlur}
                                inputRef={inputRef}
                                sx={{
                                    [`& .${inputBaseClasses.input}`]: {
                                        ...SEARCH_FIELD_FONT,
                                        '&::placeholder': { color: 'inherit', opacity: SECONDARY_ALPHA },
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                )}
            />
        );
    }

    return (
        <CustomTooltip title={t`Search`}>
            <IconButton aria-label={t`Search`} onClick={() => updateSearchOpenState(true)} color="inherit">
                <SearchRoundedIcon />
            </IconButton>
        </CustomTooltip>
    );
};
