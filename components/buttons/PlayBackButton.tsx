"use client";
import { useState } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "../ui/popover";
import { Button } from "../ui/button";
import { IconCode, Material } from "@yakad/symbols";
import { useOnRightClick } from "@yakad/use-interactions";
import {
    usePlayOptions,
    type PlayBackRate,
} from "@/contexts/playOptionsContext";

type SpeedOption = {
    value: PlayBackRate;
    label: string;
    icon: IconCode;
};

const speedOptions: SpeedOption[] = [
    { value: 0.5, label: "Slow", icon: "speed_0_5x" },
    { value: 1, label: "Normal", icon: "1x_mobiledata" },
    { value: 1.25, label: "Medium", icon: "speed_1_25" },
    { value: 1.5, label: "Fast", icon: "speed_1_5x" },
    { value: 1.75, label: "Very fast", icon: "speed_1_75" },
    { value: 2, label: "Super fast", icon: "speed_2x" },
];

export function PlayBackButton() {
    const [options, setOptions] = usePlayOptions();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const playbackSpeed = options.playBackRate ?? 1;
    const playBackActive = options.playBackActive ?? false;

    const currentIcon: IconCode =
        (speedOptions.find((option) => option.value === playbackSpeed)
            ?.icon as IconCode) ?? "speed";

    const handleSpeedChange = (value: PlayBackRate) => {
        if (value === 1) {
            setOptions((prev) => ({
                ...prev,
                playBackActive: false,
            }));
        } else {
            setOptions((prev) => ({
                ...prev,
                playBackActive: true,
                playBackRate: value,
            }));
        }
    };

    // Toggle activation/deactivation on left-click
    const handleLeftClick = () => {
        setOptions((prev) => ({
            ...prev,
            playBackActive: !prev.playBackActive,
        }));
    };

    // Handle right-click to open dropdown
    const buttonRef = useOnRightClick<HTMLButtonElement>((e) => {
        e.preventDefault();
        setPopoverOpen(true);
    });

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverAnchor asChild>
                <Button
                    ref={buttonRef}
                    variant={playBackActive ? "secondary" : "ghost"}
                    size="icon-lg"
                    onClick={handleLeftClick}
                    onContextMenu={(e) => e.preventDefault()}
                >
                    <Material icon={currentIcon} />
                </Button>
            </PopoverAnchor>
            <PopoverContent className="w-40" align="center" side="top">
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Playback Speed</h4>
                    <div className="grid gap-1">
                        {speedOptions.map(({ value, label, icon }) => (
                            <Button
                                key={value}
                                variant={
                                    playbackSpeed === value
                                        ? "secondary"
                                        : "ghost"
                                }
                                size="sm"
                                className="justify-start"
                                onClick={() => {
                                    handleSpeedChange(value);
                                    setPopoverOpen(false);
                                }}
                            >
                                <Material icon={icon} />
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
