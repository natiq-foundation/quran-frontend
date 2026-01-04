"use client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";

import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { useMushafOptions } from "@/contexts/mushafOptionsContext";
import { SelectTranslation } from "../inputs/SelectTranslation";
import { PaginatedTranslationListList } from "@ntq/sdk";
import { Symbol } from "@yakad/symbols";
import { ChangeThemeButton } from "./ChangeThemeButton";
import { useWindowSize } from "../useWindowSize";
import { Separator } from "../ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";

export function MushafSettingsButton({
    translations,
}: {
    translations: PaginatedTranslationListList;
}) {
    const [mushafOptions, setMushafOptions] = useMushafOptions();
    const [windowWidth] = useWindowSize();

    const handleSelectChange = (name: string, value: string) => {
        setMushafOptions((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Settings">
                    <Symbol icon="settings" />
                </Button>
            </SheetTrigger>
            <SheetContent
                className="overflow-y-auto"
                side={windowWidth <= 800 ? "bottom" : "right"}
            >
                <SheetHeader className="flex flex-row">
                    <Symbol icon="settings" />
                    <SheetTitle>Settings</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 p-7">
                    <Accordion
                        type="single"
                        collapsible
                        defaultValue="item-1"
                    >

                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline cursor-pointer hover:bg-accent/80 p-3">
                                <Label className="text-base font-semibold">
                                    <Symbol icon="translate" />
                                    Translation
                                </Label>
                            </AccordionTrigger>

                            <AccordionContent className="space-y-8 mt-5 p-3">
                                <div className="flex items-center gap-3">
                                    <Checkbox checked={mushafOptions.translationVisibility} onCheckedChange={(s) => setMushafOptions(prev => ({ ...prev, translationVisibility: Boolean(s) }))} id="showTranslation" />
                                    <Label htmlFor="showTranslation">Translation Visibility</Label>
                                </div>

                                <SelectTranslation translations={translations} />

                            </AccordionContent>
                        </AccordionItem>

                        <Separator />

                        <AccordionItem value="item-2">
                            <AccordionTrigger className="hover:no-underline cursor-pointer hover:bg-accent/80 p-3">
                                <Label className="text-base font-semibold">
                                    <Symbol icon="match_case" />
                                    Font
                                </Label>
                            </AccordionTrigger>
                            <AccordionContent className="p-3">
                                <div className="flex gap-2 justify-around flex-col">
                                    <div className="space-y-2">
                                        <Label htmlFor="arabicFont" className="text-sm">
                                            <Symbol icon="brand_family" />
                                            Arabic Font
                                        </Label>
                                        <Select
                                            value={"tahoma"}
                                            onValueChange={(value) =>
                                                handleSelectChange("arabicFont", value)
                                            }
                                        >
                                            <SelectTrigger id="arabicFont" className="w-full">
                                                <SelectValue placeholder="Font" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tahoma">
                                                    Tahoma
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="arabicFontSize"
                                            className="text-sm"
                                        >
                                            <Symbol icon="format_size" />
                                            Arabic Font size
                                        </Label>
                                        <Select
                                            value={mushafOptions.arabicFontSize}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "arabicFontSize",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger id="arabicFontSize" className="w-full">
                                                <SelectValue placeholder="Font size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">
                                                    Small
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="large">
                                                    Large
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="translationFontSize"
                                            className="text-sm"
                                        >
                                            <Symbol icon="format_size" />
                                            Translation Font size
                                        </Label>
                                        <Select
                                            value={mushafOptions.translationFontSize}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    "translationFontSize",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="translationFontSize"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Translation Font size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="small">Small</SelectItem>
                                                <SelectItem value="medium">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="large">Large</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="textAlign" className="text-sm">
                                            <Symbol icon="article" />
                                            Text align
                                        </Label>
                                        <Select
                                            value={mushafOptions.textAlign}
                                            onValueChange={(value) =>
                                                handleSelectChange("textAlign", value)
                                            }
                                        >
                                            <SelectTrigger id="textAlign" className="w-full">
                                                <SelectValue placeholder="Text align" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">
                                                    <Symbol icon="format_align_right" />
                                                    Normal
                                                </SelectItem>
                                                <SelectItem value="center">
                                                    <Symbol icon="format_align_center" />
                                                    Center
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <Separator />

                        <AccordionItem value="item-3">
                            <AccordionTrigger className="hover:no-underline cursor-pointer hover:bg-accent/80 p-3">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">
                                        <Symbol icon="colors" />
                                        Theme
                                    </Label>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-3">
                                <ChangeThemeButton />
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </SheetContent>
        </Sheet >
    );
}
