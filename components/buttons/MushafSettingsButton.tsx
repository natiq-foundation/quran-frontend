"use client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";

import { Moon, Palette, ZoomIn } from "lucide-react";
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

export function MushafSettingsButton({
    translations,
}: {
    translations: PaginatedTranslationListList;
}) {
    const [mushafOptions, setMushafOptions] = useMushafOptions();

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
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 p-7">
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">
                            Arabic Text
                        </Label>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="arabicFont" className="text-sm">
                                    Font
                                </Label>
                                <Select
                                    value={"Bruh"}
                                    onValueChange={(value) =>
                                        handleSelectChange("arabicFont", value)
                                    }
                                >
                                    <SelectTrigger id="arabicFont">
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
                                    Font size
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
                                    <SelectTrigger id="arabicFontSize">
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
                                <Label htmlFor="textAlign" className="text-sm">
                                    Text align
                                </Label>
                                <Select
                                    value={mushafOptions.textAlign}
                                    onValueChange={(value) =>
                                        handleSelectChange("textAlign", value)
                                    }
                                >
                                    <SelectTrigger id="textAlign">
                                        <SelectValue placeholder="Text align" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">
                                            Normal
                                        </SelectItem>
                                        <SelectItem value="center">
                                            Center
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-semibold">
                            Translate
                        </Label>

                        <SelectTranslation translations={translations} />

                        <div className="space-y-2">
                            <Label htmlFor="translation" className="text-sm">
                                Translation
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="translationFontSize"
                                className="text-sm"
                            >
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
                                <SelectTrigger id="translationFontSize">
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
                    </div>

                    <div className="space-y-4">
                        <Label className="text-base font-semibold">Theme</Label>

                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
                            >
                                <Moon className="h-5 w-5" />
                                <span className="text-xs">Dark</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
                            >
                                <Palette className="h-5 w-5" />
                                <span className="text-xs">Color</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="flex flex-col items-center gap-2 h-auto py-4 bg-transparent"
                            >
                                <ZoomIn className="h-5 w-5" />
                                <span className="text-xs">Zoom</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
