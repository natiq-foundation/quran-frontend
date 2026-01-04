"use client";

import { createLocalStorageContext } from "@yakad/lib";

interface Selected {
    mushafUUID: string;
    ayahUUID: string | undefined;
    translationUUID: string;
    translationRtl: boolean;
    translationByWordUUID: string;
    recitationUUID: string;
    wordUUID: string;
    bookmarkedAyahUUID: string;
}

const defaultSelected: Selected = {
    mushafUUID: "hafs",
    ayahUUID: undefined,
    translationUUID: "UUID",
    translationRtl: false,
    translationByWordUUID: "UUID",
    recitationUUID: "UUID",
    wordUUID: "UUID",
    bookmarkedAyahUUID: "UUID",
};

const [SelectedProvider, useSelected] = createLocalStorageContext<Selected>(
    "selected",
    defaultSelected
);

export { SelectedProvider, useSelected };
