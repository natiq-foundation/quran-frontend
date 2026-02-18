"use client";

import { PaginatedTranslationListList, TranslationList } from "@ntq/sdk";
import { useSelected } from "@/contexts/selectedsContext";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { LangCodeType, langNameInEnglish } from "@yakad/lib";
import { ButtonGroup } from "../ui/button-group";
import { Material } from "@yakad/symbols";

export function SelectTranslation({
    translations,
}: {
    translations: PaginatedTranslationListList;
}) {
    const [selected, setSelected] = useSelected();
    const [languageOpen, setLanguageOpen] = useState(false);
    const [translatorOpen, setTranslatorOpen] = useState(false);

    const [value, setValue] = useState(() => {
        const current = translations.find(
            (translation) => translation.uuid === selected.translationUUID
        );

        return current
            ? `${current.language}:${current.uuid}:${current.language_is_rtl}`
            : "";
    });

    const handleSelectChange = (value: string) => {
        const [, translation_uuid, language_is_rtl] = value.split(":");

        setSelected((prev) => ({
            ...prev,
            translationUUID: translation_uuid,
            translationRtl: language_is_rtl === "true" ? true : false,
        }));
    };

    const getTranslatorName = (translation: TranslationList) => {
        return translation.translator?.name;
    };

    const translatorsByLanguage = useMemo(() => {
        const map = new Map<string, TranslationList[]>();

        translations.forEach((translation) => {
            const lang = translation.language;
            const current = map.get(lang) ?? [];

            current.push(translation);
            map.set(lang, current);
        });

        return map;
    }, [translations]);

    const languages = useMemo(
        () => Array.from(new Set(translations.map((t) => t.language))),
        [translations]
    );

    const selectedTranslation = translations.find(
        (translation) =>
            `${translation.language}:${translation.uuid}:${translation.language_is_rtl}` ===
            value
    );

    const selectedLanguage = value ? value.split(":")[0] : undefined;
    const translatorsForSelectedLanguage = selectedLanguage
        ? translatorsByLanguage.get(selectedLanguage) ?? []
        : [];

    return (
        <div className="flex flex-row gap-3">
            <ButtonGroup className="w-full justify-center">
                <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                    <PopoverTrigger asChild className="w-auto">
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={languageOpen}
                            className="justify-between"
                        >
                            <Material icon="language" />
                            {selectedLanguage
                                ? langNameInEnglish(
                                      selectedLanguage as LangCodeType
                                  )
                                : "Select Translation..."}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                        <Command>
                            <CommandInput placeholder="Search language..." />
                            <CommandList>
                                <CommandEmpty>No languages found!</CommandEmpty>
                                <CommandGroup heading="Languages">
                                    {languages.map((language) => {
                                        const translationsForLanguage =
                                            translatorsByLanguage.get(
                                                language
                                            ) ?? [];
                                        const firstTranslation =
                                            translationsForLanguage[0];

                                        if (!firstTranslation) return null;

                                        const itemValue = `${firstTranslation.language}:${firstTranslation.uuid}:${firstTranslation.language_is_rtl}`;

                                        return (
                                            <CommandItem
                                                key={language}
                                                value={itemValue}
                                                onSelect={(currentValue) => {
                                                    handleSelectChange(
                                                        currentValue
                                                    );
                                                    setValue(
                                                        currentValue === value
                                                            ? ""
                                                            : currentValue
                                                    );
                                                    setLanguageOpen(false);
                                                }}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedLanguage ===
                                                            language
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {langNameInEnglish(
                                                    language as LangCodeType
                                                )}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Translator selector */}
                <Popover open={translatorOpen} onOpenChange={setTranslatorOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={translatorOpen}
                            className="justify-between"
                        >
                            <Material icon="person" />
                            {selectedTranslation
                                ? getTranslatorName(selectedTranslation)
                                : "Select Translator..."}
                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandInput placeholder="Search translator..." />
                            <CommandList>
                                <CommandEmpty>
                                    No translators found!
                                </CommandEmpty>
                                <CommandGroup heading="Translators">
                                    {translatorsForSelectedLanguage.map(
                                        (translation, index) => (
                                            <CommandItem
                                                key={index}
                                                value={`${translation.language}:${translation.uuid}:${translation.language_is_rtl}`}
                                                onSelect={(currentValue) => {
                                                    handleSelectChange(
                                                        currentValue
                                                    );
                                                    setValue(
                                                        currentValue === value
                                                            ? ""
                                                            : currentValue
                                                    );
                                                    setTranslatorOpen(false);
                                                }}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value ===
                                                            `${translation.language}:${translation.uuid}:${translation.language_is_rtl}`
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                    )}
                                                />
                                                {getTranslatorName(translation)}
                                            </CommandItem>
                                        )
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </ButtonGroup>
        </div>
    );
}
