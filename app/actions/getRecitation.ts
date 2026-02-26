"use server";

import {
    PaginatedRecitationListList,
    recitationsList,
    recitationsRetrieve,
    client,
} from "@ntq/sdk";

export async function getRecitations(
    mushaf: "hafs",
    limit: number,
    offset: number = 1,
): Promise<PaginatedRecitationListList> {
    const response = await recitationsList({query: { mushaf: mushaf, limit: limit, offset: offset}});

    if (!response.data) throw Error("Error when Getting recitations list");

    return response.data;
}

type WordTimestamp = {
    start: string;
    end: string | null;
    word_uuid: string | null;
};

type TrackDetail = {
    uuid: string;
    surah_uuid: string;
    file_url: string | null;
    words_timestamps: WordTimestamp[];
    ayahs_timestamps: string[];
};

type RecitationWithTracks = {
    uuid: string;
    recitation_surahs: {
        uuid: string;
        surah_uuid: string;
        file_url: string | null;
    }[];
    words_timestamps: {
        surah: string;
        timestamps: WordTimestamp[];
    }[];
    ayahs_timestamps: {
        surah: string;
        timestamps: string[];
    }[];
    // Allow any other fields from the API response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
};

export async function getRecitation(uuid: string): Promise<RecitationWithTracks> {
    const response = await recitationsRetrieve({ path: { uuid } });

    if (!response.data) {
        throw Error(
            `Error when Getting recitation ${uuid}, ${response.data}, ${response.status}`
        );
    }

    const base = response.data as unknown as {
        uuid: string;
        recitation_surahs?: {
            uuid: string;
            surah_uuid: string;
            file_url: string | null;
        }[];
        // Allow any other fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };

    const recitationSurahs = base.recitation_surahs ?? [];

    if (recitationSurahs.length === 0) {
        return {
            ...base,
            recitation_surahs: [],
            words_timestamps: [],
            ayahs_timestamps: [],
        };
    }

    const tracks: TrackDetail[] = await Promise.all(
        recitationSurahs.map(async (trackMeta) => {
            try {
                const trackResponse = await client.get<TrackDetail>({
                    url: `/recitations/${base.uuid}/track/${trackMeta.uuid}/`,
                    responseType: "json",
                });

                return trackResponse.data as TrackDetail;
            } catch (error) {
                // If a single track fails to load, skip it instead of failing the whole recitation.
                console.error(
                    "Error loading track details for recitation",
                    base.uuid,
                    "track",
                    trackMeta.uuid,
                    error
                );
                return {
                    uuid: trackMeta.uuid,
                    surah_uuid: trackMeta.surah_uuid,
                    file_url: trackMeta.file_url,
                    words_timestamps: [],
                    ayahs_timestamps: [],
                };
            }
        })
    );

    const wordsBySurah: Record<string, WordTimestamp[]> = {};
    const ayahsBySurah: Record<string, string[]> = {};

    for (const track of tracks) {
        const surahUuid = track.surah_uuid;
        wordsBySurah[surahUuid] = track.words_timestamps ?? [];
        ayahsBySurah[surahUuid] = track.ayahs_timestamps ?? [];
    }

    const words_timestamps = Object.entries(wordsBySurah).map(
        ([surah, timestamps]) => ({
            surah,
            timestamps,
        })
    );

    const ayahs_timestamps = Object.entries(ayahsBySurah).map(
        ([surah, timestamps]) => ({
            surah,
            timestamps,
        })
    );

    return {
        ...base,
        recitation_surahs: recitationSurahs,
        words_timestamps,
        ayahs_timestamps,
    };
}