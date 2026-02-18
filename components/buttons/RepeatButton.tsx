"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Material } from "@yakad/symbols";
import { RepeatRange, usePlayOptions } from "@/contexts/playOptionsContext";

export function RepeatButton() {
    const [options, setPlayOptions] = usePlayOptions();
    const skipModeOn = options.repeatMode !== "off";
    const skipType = options.repeatRange;

    const skipTypes: RepeatRange[] = [
        // "ayah", This has a deferent icon so we hard code it
        "surah",
        "juz",
        "hizb",
        "ruku",
        "page",
    ];

    const handleRepeatChange = (
        type: RepeatRange,
        mode: "ayah" | "off" | "range"
    ) => {
        setPlayOptions((prev) => ({
            ...prev,
            repeatRange: type,
            repeatMode: mode,
        }));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={skipModeOn ? "secondary" : "ghost"}
                    size="icon-lg"
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Material
                        icon={
                            options.repeatMode === "ayah"
                                ? "repeat_one"
                                : "repeat"
                        }
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-44" align="center" side="top">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Repeat</h4>
                    <div className="grid gap-1">
                        <Button
                            variant={!skipModeOn ? "secondary" : "ghost"}
                            size="sm"
                            className="justify-start"
                            onClick={() => handleRepeatChange(skipType, "off")}
                        >
                            Continuous
                        </Button>
                        <Button
                            variant={
                                options.repeatMode === "ayah"
                                    ? "secondary"
                                    : "ghost"
                            }
                            size="sm"
                            className="justify-start"
                            onClick={() => handleRepeatChange("ayah", "ayah")}
                        >
                            <Material icon="repeat_one" /> Ayah
                        </Button>
                        {skipTypes.map((type) => (
                            <Button
                                key={type}
                                variant={
                                    options.repeatMode === "range" &&
                                    skipType === type
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                className="justify-start"
                                onClick={() =>
                                    handleRepeatChange(type, "range")
                                }
                            >
                                <Material icon="repeat" />{" "}
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
