"use server";

import {
    translationsAyahsList,
    translationsList,
    TranslationsListData,
} from "@ntq/sdk";

export async function getTranslations(
    mushaf: "hafs" = "hafs",
    limit: number,
    offset: number = 0,
    language: TranslationsListData["query"]["language"] | null = null
) {
    const response = await translationsList({
        query: {
            mushaf: mushaf,
            limit: limit,
            offset: offset,
            language: language || undefined,
        },
    });

    if (!response.data)
        throw new Error(
            `Error when getting translations list, status: ${response.status}, msg: ${response.data}`
        );

    return response.data;
}

export async function getTranslationAyahs(
    uuid: string,
    limit: number,
    offset: number = 1
) {
    const response = await translationsAyahsList({
        path: { uuid: uuid },
        query: { limit: limit, offset: offset },
    });

    if (!response.data)
        throw new Error(
            `Error when getting translation ayahs list, status: ${response.status}, msg: ${response.data}`
        );

    return response.data;
}
