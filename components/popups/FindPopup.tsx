import { useSelected } from "@/contexts/selectedsContext";
import { AyahBreakersResponse, Surah } from "@ntq/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface FindPopupProps {
    surahs: Surah[];
    takhtitsAyahsBreakers: AyahBreakersResponse[];
    onButtonClicked: (surah_num: number, ayah_num: number) => void;
    onClose?: () => void;
}

export function FindPopup({
    surahs,
    takhtitsAyahsBreakers,
    onButtonClicked,
    onClose,
}: FindPopupProps) {
    const breakers: AyahBreakersResponse[] = useMemo(
        () => [
            {
                ayah: 1,
                hizb: 0,
                juz: 0,
                page: 1,
                manzil: 0,
                rub: 0,
                ruku: 0,
                surah: 1,
                uuid: "",
                length: 0,
            },
            ...(takhtitsAyahsBreakers || []),
        ],
        [takhtitsAyahsBreakers]
    );
    const [selected] = useSelected();
    const [currentSurah, setCurrentSurah] = useState<number>();
    const [currentAyah, setCurrentAyah] = useState<number>();
    const [currentJuz, setCurrentJuz] = useState<number>();
    const [currentHizb, setCurrentHizb] = useState<number>();
    // Ruku selection is not implemented yet; keep placeholder Select disabled below
    const [currentPage, setCurrentPage] = useState<number>();

    // Find current ayah from localStorage and set initial state
    useEffect(() => {
        if (selected.ayahUUID && breakers.length > 0) {
            const currentAyahData = breakers.find(
                (ayah) => ayah.uuid === selected.ayahUUID
            );

            if (currentAyahData) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentSurah(currentAyahData.surah);
                setCurrentAyah(currentAyahData.ayah);
                setCurrentPage(currentAyahData.page || 1);

                // Set juz if available in the data
                if (currentAyahData.juz) {
                    setCurrentJuz(currentAyahData.juz);
                }

                // Set hizb if available in the data
                if (currentAyahData.hizb) {
                    setCurrentHizb(currentAyahData.hizb);
                }
            }
        } else {
            // Set default values if no ayah is selected
            setCurrentSurah(1);
            setCurrentAyah(1);
        }
    }, [selected.ayahUUID, breakers]);

    // Unified function to update all selections based on an ayah
    const updateAllSelections = useCallback((ayah: AyahBreakersResponse) => {
        setCurrentSurah(ayah.surah);
        setCurrentAyah(ayah.ayah);
        setCurrentPage(ayah.page || 1);

        // Set juz if available in the data
        if (ayah.juz) {
            setCurrentJuz(ayah.juz);
        }

        // Set hizb if available in the data
        if (ayah.hizb) {
            setCurrentHizb(ayah.hizb);
        }
    }, []);

    // Extract juz and hizb data dynamically from breakers
    const juzData = useMemo(() => {
        const juzMap = new Map();
        breakers.forEach((ayah) => {
            // Check if ayah has juz property
            if (ayah.juz && !juzMap.has(ayah.juz)) {
                juzMap.set(ayah.juz, {
                    surah: ayah.surah,
                    ayah: ayah.ayah,
                });
            }
        });

        // If no juz data found in the ayah objects, return empty array
        if (juzMap.size === 0) {
            console.log(
                "No juz data found in breakers. Available properties:",
                breakers.length > 0 ? Object.keys(breakers[0]) : "No data"
            );
            return [];
        }

        return Array.from(juzMap, ([juz, { surah, ayah }]) => ({
            juz,
            surah,
            ayah,
        }));
    }, [breakers]);

    const hizbData = useMemo(() => {
        const hizbMap = new Map();
        breakers.forEach((ayah) => {
            // Check if ayah has hizb property
            if (ayah.hizb && !hizbMap.has(ayah.hizb)) {
                hizbMap.set(ayah.hizb, {
                    surah: ayah.surah,
                    ayah: ayah.ayah,
                });
            }
        });

        // If no hizb data found in the ayah objects, return empty array
        if (hizbMap.size === 0) {
            console.log(
                "No hizb data found in breakers. Available properties:",
                breakers.length > 0 ? Object.keys(breakers[0]) : "No data"
            );
            return [];
        }

        return Array.from(hizbMap, ([hizb, { surah, ayah }]) => ({
            hizb,
            surah,
            ayah,
        }));
    }, [breakers]);

    // Binary search function to find ayah by juz/hizb/ruku
    const findAyahByJuz = useMemo(() => {
        return (juz: number) => {
            // Use dynamic juz data extracted from breakers
            const mapping = juzData.find((m) => m.juz === juz);
            if (!mapping) return null;

            // Find the ayah in breakers
            return breakers.find(
                (ayah) =>
                    ayah.surah === mapping.surah && ayah.ayah === mapping.ayah
            );
        };
    }, [breakers, juzData]);

    const findAyahByHizb = useMemo(() => {
        return (hizb: number) => {
            // Use dynamic hizb data extracted from breakers
            const mapping = hizbData.find((m) => m.hizb === hizb);
            if (!mapping) return null;

            // Find the ayah in breakers
            return breakers.find(
                (ayah) =>
                    ayah.surah === mapping.surah && ayah.ayah === mapping.ayah
            );
        };
    }, [breakers, hizbData]);

    const findAyahByPage = useMemo(() => {
        return (page: number) => {
            if (page === 1) return breakers[0];
            // Find the first ayah on the specified page
            return breakers.find((ayah) => ayah.page === page);
        };
    }, [breakers]);

    // Get unique juz, hizb, and page numbers for dropdowns
    const availableJuz = useMemo(() => {
        return juzData.map((juz) => juz.juz).sort((a, b) => a - b);
    }, [juzData]);

    const availableHizb = useMemo(() => {
        return hizbData.map((hizb) => hizb.hizb).sort((a, b) => a - b);
    }, [hizbData]);

    const availablePages = useMemo(() => {
        const pages = new Set(
            breakers.map((ayah) => ayah.page).filter(Boolean)
        );
        return Array.from([...pages]).sort((a, b) => (a || 0) - (b || 0));
    }, [breakers]);

    // Handle juz selection
    const handleJuzSelect = (juz: number) => {
        setCurrentJuz(juz);
        const ayah = findAyahByJuz(juz);
        if (ayah) {
            updateAllSelections(ayah);
        }
    };

    // Handle hizb selection
    const handleHizbSelect = (hizb: number) => {
        setCurrentHizb(hizb);
        const ayah = findAyahByHizb(hizb);
        if (ayah) {
            updateAllSelections(ayah);
        }
    };

    // Handle page selection
    const handlePageSelect = (page: number) => {
        setCurrentPage(page);
        const ayah = findAyahByPage(page);
        if (ayah) {
            updateAllSelections(ayah);
        }
    };

    // Handle surah selection
    const handleSurahSelect = (surah: number) => {
        setCurrentSurah(surah);
        // Reset ayah to 1 when surah changes
        setCurrentAyah(1);

        // Find the first ayah of the selected surah to get juz/hizb/page info
        const firstAyahOfSurah = breakers.find(
            (ayah) => ayah.surah === surah && ayah.ayah === 1
        );
        if (firstAyahOfSurah) {
            setCurrentPage(firstAyahOfSurah.page || undefined);
            if (firstAyahOfSurah.juz) {
                setCurrentJuz(firstAyahOfSurah.juz);
            }
            if (firstAyahOfSurah.hizb) {
                setCurrentHizb(firstAyahOfSurah.hizb);
            }
        }
    };

    // Handle ayah selection
    const handleAyahSelect = (ayah: number) => {
        setCurrentAyah(ayah);

        // Find the selected ayah to get juz/hizb/page info
        const selectedAyah = breakers.find(
            (ayahData) =>
                ayahData.surah === currentSurah && ayahData.ayah === ayah
        );
        if (selectedAyah) {
            setCurrentPage(selectedAyah.page || 1);
            if (selectedAyah.juz) {
                setCurrentJuz(selectedAyah.juz);
            }
            if (selectedAyah.hizb) {
                setCurrentHizb(selectedAyah.hizb);
            }
        }
    };

    return (
        <>
            <h3>By Surah</h3>
            <div className="flex flex-row gap-5">
                <Select
                    value={currentSurah?.toString() || ""}
                    onValueChange={(value) => {
                        handleSurahSelect(+value);
                    }}
                >
                    <SelectTrigger id="surah" className="w-45">
                        <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Surahs</SelectLabel>
                            {surahs.map((surah, index) => (
                                <SelectItem
                                    key={surah.number}
                                    value={`${surah.number}`}
                                >
                                    {index + 1}. {surah.names[0]?.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select
                    value={currentAyah?.toString() || ""}
                    onValueChange={(value) => {
                        handleAyahSelect(+value);
                    }}
                >
                    <SelectTrigger id="ayah" className="w-[180px]">
                        <SelectValue placeholder="Select Ayah" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Ayahs</SelectLabel>
                            {[
                                ...new Array(
                                    surahs.find(
                                        (surah) => surah.number === currentSurah
                                    )?.number_of_ayahs || 0
                                ),
                            ].map((_, index) => (
                                <SelectItem
                                    key={index + 1}
                                    value={`${index + 1}`}
                                >
                                    {index + 1}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <h3>By Juz/Hizb/Ruku</h3>
            <div className="flex flex-row gap-5">
                <Select
                    value={currentJuz?.toString() || ""}
                    disabled={juzData.length === 0}
                    onValueChange={(value) => handleJuzSelect(+value)}
                >
                    <SelectTrigger id="juz" className="w-[180px]">
                        <SelectValue placeholder="Select Juz" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Juzs</SelectLabel>
                            {availableJuz.map((juz) => (
                                <SelectItem key={juz} value={juz.toString()}>
                                    {juz}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select
                    value={currentHizb?.toString() || ""}
                    disabled={hizbData.length === 0}
                    onValueChange={(val) => handleHizbSelect(+val)}
                >
                    <SelectTrigger id="hizb" className="w-[180px]">
                        <SelectValue placeholder="Select Hizb" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Hizbs</SelectLabel>
                            {availableHizb.map((hizb) => (
                                <SelectItem key={hizb} value={hizb.toString()}>
                                    {hizb}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <h3>By Page</h3>
            <div>
                <Select
                    value={currentPage?.toString() || ""}
                    onValueChange={(val) => handlePageSelect(+val)}
                >
                    <SelectTrigger id="page" className="w-[180px]">
                        <SelectValue placeholder="Select Page" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Pages</SelectLabel>
                            {availablePages.map((page) => (
                                <SelectItem
                                    key={page}
                                    value={page?.toString() || ""}
                                >
                                    {page}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Button
                    className="w-full"
                    onClick={() => {
                        onButtonClicked(currentSurah || 1, currentAyah || 1);
                        onClose?.();
                    }}
                >
                    Find
                </Button>
            </div>
        </>
    );
}
