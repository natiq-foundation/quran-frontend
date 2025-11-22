"use client";
import { usePlayOptions } from "@/contexts/playOptionsContext";
import { Progress } from "./ui/progress";

export default function PlayerProgress() {
    const [playOptions] = usePlayOptions();

    return <Progress value={playOptions.progress} className="h-0.5" />;
}
