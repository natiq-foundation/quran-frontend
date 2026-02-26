"use client";

import { Material } from "@yakad/symbols";

import { useEffect, useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Item, ItemContent, ItemTitle } from "./ui/item";
import { AyahBreakersResponse, Surah } from "@ntq/sdk";
import { FindPopup } from "./popups/FindPopup";

interface FindBarProps {
    takhtitsAyahsBreakers: AyahBreakersResponse[];
    surahs: Surah[];
    ayahUuid?: string;
    onAyahSelect?: (ayahUuid: string) => void;
}

export function FindBar({
    takhtitsAyahsBreakers,
    surahs,
    ayahUuid,
    onAyahSelect,
}: FindBarProps) {
    const [top, setTop] = useState(2);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    // Calculate current ayah info from provided ayah UUID and takhtits data
    const currentAyahInfo = useMemo(() => {
        if (!ayahUuid) {
            return {
                surahnumber: 1,
                ayahnumber: 1,
                pagenumber: 1,
                juz: 1,
                hizb: 1,
                surahName: "Al-Fatihah",
            };
        }

        const currentAyah = takhtitsAyahsBreakers.find(
            (ayah) => ayah.uuid === ayahUuid
        );

        if (!currentAyah) {
            return {
                surahnumber: 1,
                ayahnumber: 1,
                pagenumber: 1,
                juz: 1,
                hizb: 1,
                surahName: "Al-Fatihah",
            };
        }

        const surah = surahs.find((s) => s.number === currentAyah.surah);
        const surahName = surah
            ? surah.names?.[0]?.name || `Surah ${currentAyah.surah}`
            : `Surah ${currentAyah.surah}`;

        return {
            surahnumber: currentAyah.surah,
            ayahnumber: currentAyah.ayah,
            pagenumber: currentAyah.page! - 1 || 1,
            juz: currentAyah.juz! - 1 || 1,
            hizb: currentAyah.hizb || 1,
            surahName: surahName,
        };
    }, [ayahUuid, takhtitsAyahsBreakers, surahs]);

    const handleAyahSelection = (surahNum: number, ayahNum: number) => {
        const targetAyah = takhtitsAyahsBreakers.find(
            (ayah) => ayah.surah === surahNum && ayah.ayah === ayahNum
        );

        if (targetAyah?.uuid) {
            onAyahSelect?.(targetAyah.uuid);
            setIsOpen(false); // Close the dialog when ayah is selected
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scroll down
                setTop(2);
            } else {
                // Scroll up
                setTop(8);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <>
            <Item
                size="sm"
                onClick={() => setIsOpen(true)}
                variant="default"
                data-find-bar="true"
                className="p-2.5 pl-6 pr-6 z-10 max-w-full sticky top-22 bg-accent/80 backdrop-blur supports-backdrop-filter:bg-accent/80 cursor-pointer rounded-full shadow-[0_-16px_3px_5px] shadow-background"
            >
                <ItemContent>
                    <ItemTitle className="w-full flex flex-row items-center justify-between gap-0.5">
                        <div className="flex flex-row items-center gap-3">
                            <h3>
                                {currentAyahInfo.surahnumber + ". " + currentAyahInfo.surahName +
                                    ": " +
                                    currentAyahInfo.ayahnumber}
                            </h3>
                        </div>
                        <div className="flex flex-row items-center gap-3">
                            <h3 color="onSurfaceVariantColor">
                                {"Juz: " +
                                    currentAyahInfo.juz +
                                    " / " +
                                    "Page: " +
                                    currentAyahInfo.pagenumber}
                            </h3>
                            <Material
                                icon="menu_book"
                                style={
                                    currentAyahInfo.pagenumber % 2 !== 0
                                        ? undefined
                                        : { transform: "scaleX(-1)" }
                                }
                            />
                        </div>
                    </ItemTitle>
                </ItemContent>
            </Item>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Jumpt to Ayah</DialogTitle>
                        <DialogDescription>
                            Find your specific ayah using parameters below
                        </DialogDescription>
                    </DialogHeader>
                    <FindPopup
                        surahs={surahs}
                        takhtitsAyahsBreakers={takhtitsAyahsBreakers}
                        onButtonClicked={handleAyahSelection}
                        onClose={() => setIsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
