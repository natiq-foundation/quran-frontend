"use server";

import { surahsList, surahsRetrieve } from "@ntq/sdk";

export async function getSurahs(mushaf: "hafs" | string) {
    // TODO: remove as
    const response = await surahsList({query: { mushaf: mushaf as "hafs" }});

    if (!response.data) throw new Error(`Error when getting Surahs list!, status: ${response.status}, msg: ${response.data}`)

    return response.data;
}

export async function getSurah(uuid:string) {
    const response = await surahsRetrieve({path: {uuid:uuid}});

    if (!response.data) throw new Error(`Error when getting Surah!, status: ${response.status}, msg: ${response.data}`);

    return response.data;
}