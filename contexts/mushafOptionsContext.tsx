"use client";

import { createLocalStorageContext } from "@yakad/lib";

export interface MushafOptions {
    arabicFont: "test";
    arabicFontSize: "small" | "medium" | "large";
    textAlign: "normal" | "center";
    translationFontSize: "small" | "medium" | "large";
    translationVisibility: boolean;
}

const defaultMushafOptions: MushafOptions = {
    arabicFont: "test",
    arabicFontSize: "medium",
    textAlign: "center",
    translationFontSize: "medium",
    translationVisibility: true,
};

const [MushafOptionsProvider, useMushafOptions] =
    createLocalStorageContext<MushafOptions>(
        "mushafOptions",
        defaultMushafOptions
    );

export { MushafOptionsProvider, useMushafOptions };
