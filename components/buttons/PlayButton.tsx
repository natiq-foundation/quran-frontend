"use client";

import { Button } from "@/components/ui/button";
import { usePlayOptions } from "@/contexts/playOptionsContext";
import { Symbol } from "@yakad/symbols";
import { Spinner } from "../ui/spinner";

export function PlayButton() {
    const [playOptions, setPlayOptions] = usePlayOptions();

    const togglePlaying = () => {
        if (playOptions.loading) return;
        setPlayOptions((prev) => ({
            ...prev,
            playing: !prev.playing,
        }));
    };

    return (
        <Button
            variant="default"
            size="icon-lg"
            onClick={togglePlaying}
            disabled={playOptions.loading}
        >
            {playOptions.loading ? (
                <Spinner />
            ) : playOptions.playing ? (
                <Symbol icon="pause" filled />
            ) : (
                <Symbol icon="play_arrow" filled />
            )}
        </Button>
    );
}
