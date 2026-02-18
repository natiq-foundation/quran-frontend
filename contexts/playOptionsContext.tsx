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
    // Optional list of ayah UUIDs representing the current page's range.
    // This is populated by the mushaf page component and used for page-repeat.
    pageAyahUUIDs?: string[];
    // Optional list of ayah UUIDs representing the current juz/hizb range.
    // These are populated from takhtit breakers using the visible ayah.
    juzAyahUUIDs?: string[];
    hizbAyahUUIDs?: string[];
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
    pageAyahUUIDs: [],
    juzAyahUUIDs: [],
    hizbAyahUUIDs: [],
    autoScroll: true,
    loading: false,
    progress: 0,
};

const [PlayOptionsProvider, usePlayOptions] =
    createLocalStorageContext<Options>("options", defaultOptions);

export { PlayOptionsProvider, usePlayOptions };
