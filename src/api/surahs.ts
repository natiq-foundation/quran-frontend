import { surahsList, surahsRetrieve, type Surah } from "@ntq/sdk"

type Mushaf = "hafs" | string

export async function getSurahs(
    mushaf: Mushaf,
    options?: { search?: string; limit?: number; offset?: number }
): Promise<Surah[]> {
    const response = await surahsList({
        query: {
            mushaf: mushaf as "hafs",
            limit: options?.limit ?? 150,
            offset: options?.offset,
            search: options?.search || undefined,
        },
    })

    if (!response.data) {
        throw new Error(`Failed to get surahs, status: ${response.status}`)
    }
    return response.data
}

export async function getSurah(id: string): Promise<Surah> {
    const response = await surahsRetrieve({
        path: { id },
    })

    if (!response.data) {
        throw new Error(`Failed to get surah ${id}, status: ${response.status}`)
    }

    return response.data
}