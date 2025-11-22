"use client";

import { PaginatedTranslationListList } from "@ntq/sdk";
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
import { useState } from "react";

export function SelectTranslation({
    translations,
}: {
    translations: PaginatedTranslationListList;
}) {
    const [selected, setSelected] = useSelected();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(
        `${
            translations.find(
                (translation) => translation.uuid === selected.translationUUID
            )?.language
        }:${selected.translationUUID}:${selected.translationRtl}`
    );

    const handleSelectChange = (value: string) => {
        const [language, translation_uuid, language_is_rtl] = value.split(":");

        setSelected((prev) => ({
            ...prev,
            translationUUID: translation_uuid,
            translationRtl: language_is_rtl === "true" ? true : false,
        }));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {value
                        ? translations.find(
                              (translation) =>
                                  `${translation.language}:${translation.uuid}:${translation.language_is_rtl}` ===
                                  value
                          )?.language
                        : "Select Translation..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search translation..." />
                    <CommandList>
                        <CommandEmpty>No translations found!</CommandEmpty>
                        <CommandGroup heading="Translations">
                            {translations.map((translation, index) => (
                                <CommandItem
                                    key={index}
                                    value={`${translation.language}:${translation.uuid}:${translation.language_is_rtl}`}
                                    onSelect={(currentValue) => {
                                        handleSelectChange(currentValue);
                                        setValue(
                                            currentValue === value
                                                ? ""
                                                : currentValue
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value ===
                                                `${translation.uuid}:${translation.language_is_rtl}`
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {translation.language}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
