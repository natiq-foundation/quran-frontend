import { Ayah, ayahsList } from "@ntq/sdk";

export async function getAyahs(
    mushaf: string,
    limit: number,
    offset: number = 0,
): Promise<{ data: Ayah[], error: Error | undefined }> {
    const response = await ayahsList({
        params: { mushaf: mushaf },
        query: { limit: limit, offset: offset },
    });

    if (!response.data)
        return { data: [], error: new Error(`Error...`) };

    return { data: response.data, error: undefined };
}