"use client";

import { createLocalStorageContext } from "@yakad/lib";

export type PlayBackRate = 0.5 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type RepeatRange = "ayah" | "surah" | "juz" | "hizb" | "ruku" | "page";

interface Options {
    playing: boolean;
    playBoxShow: boolean;
    recitationStatus: boolean;
    playBackRate: PlayBackRate;
    playBackActive: boolean;
    repeatMode: "off" | "range" | "ayah";
    repeatRange: RepeatRange;
    autoScroll: boolean;
    loading: boolean;
    progress: number;
}

const defaultOptions: Options = {
    playing: false,
    playBoxShow: false,
    recitationStatus: true,
    playBackActive: false,
    playBackRate: 1.5,
    repeatMode: "off",
    repeatRange: "surah",
    autoScroll: true,
    loading: false,
    progress: 0,
};

const [PlayOptionsProvider, usePlayOptions] =
    createLocalStorageContext<Options>("options", defaultOptions);

export { PlayOptionsProvider, usePlayOptions };
