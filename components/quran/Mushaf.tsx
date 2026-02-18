import { MushafClient } from "./MushafClient";
import {
    getTakhtits,
    getTakhtitsAyahsBreakers,
} from "@/app/actions/getTakhtits";
import { getSurahs } from "@/app/actions/getSurahs";
import { AyahBreakersResponse } from "@ntq/sdk";

export interface CalculatedPage {
    pageNumber: number;
    ayahCount: number;
    offset: number;
    limit: number;
    ayahUUIDs: string[];
}

function calculatePages(
    takhtitsAyahsBreakers: AyahBreakersResponse[]
): CalculatedPage[] {
    // Get unique page numbers from takhtits and sort them
    const uniquePages = Array.from(
        new Set(
            takhtitsAyahsBreakers
                .map((ayah) => ayah.page)
                .filter((p): p is number => !!p)
        )
    ).sort((a, b) => a - b);

    // Calculate ayah range for each page directly from takhtits
    return uniquePages.map((pageNumber) => {
        const pageAyahs = takhtitsAyahsBreakers.filter(
            (ayah) => ayah.page === pageNumber
        );
        const firstAyahIndex = takhtitsAyahsBreakers.findIndex(
            (ayah) => ayah.page === pageNumber
        );
        const lastAyahIndex = takhtitsAyahsBreakers.findLastIndex(
            (ayah) => ayah.page === pageNumber
        );

        return {
            pageNumber: pageNumber - 1,
            ayahCount: pageAyahs.length,
            offset: firstAyahIndex,
            limit: lastAyahIndex - firstAyahIndex + 1,
            ayahUUIDs: pageAyahs.map((ayah) => ayah.uuid),
        };
    });
}

export default async function Mushaf({ name }: { name: string }) {
    "use cache";

    const firstTakhtit = await getTakhtits(name);
    const firstTakhtitUuid = firstTakhtit[0].uuid;
    const takhtitsAyahsBreakers = await getTakhtitsAyahsBreakers(
        firstTakhtitUuid
    );
    const surahs = await getSurahs(name);
    const calculated_pages = calculatePages(takhtitsAyahsBreakers);

    return (
        <MushafClient
            calculated_pages={calculated_pages}
            takhtitsAyahsBreakers={takhtitsAyahsBreakers}
            surahs={surahs}
            mushaf={name}
        />
    );
}
