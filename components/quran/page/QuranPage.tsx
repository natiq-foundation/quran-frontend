"use client";

import { AyahBreakersResponse, Surah } from "@ntq/sdk";
import { AyahsRange } from "../AyahsRange";
import { useSelected } from "@/contexts/selectedsContext";
import { useMushafOptions } from "@/contexts/mushafOptionsContext";
import { useEffect, useEffectEvent, useState } from "react";
import { FindBar } from "@/components/FindBar";
import { getTranslations } from "@/app/actions/getTranslations";

interface QuranPageProps {
    index: number;
    mushaf?: string;
    page: {
        pageNumber: number;
        ayahCount: number;
        offset: number;
        limit: number;
    };
    className?: string;
    takhtitsAyahsBreakers: AyahBreakersResponse[];
    surahs: Surah[];
    onLoad?: () => void;
}

export function QuranPage({
    mushaf = "hafs",
    className,
    takhtitsAyahsBreakers,
    surahs,
    page,
    onLoad,
}: QuranPageProps) {
    // If no ayahs found for this page, show a message
    const [mushafOptions] = useMushafOptions();
    const [selected, setSelected] = useSelected();
    const [visible, setVisible] = useState<string>(
        takhtitsAyahsBreakers[page.offset].uuid || ""
    );
    const [mounted, setMounted] = useState(false);

    const setMountedEffect = useEffectEvent(() => setMounted(true));

    // Ensure we're on the client side before checking localStorage
    useEffect(() => {
        setMountedEffect();
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const stored =
            typeof window !== "undefined"
                ? localStorage.getItem("selected")
                : null;

        let hasStoredTranslation = false;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                hasStoredTranslation =
                    parsed?.translationUUID &&
                    parsed.translationUUID !== "UUID" &&
                    parsed.translationUUID !== "";
            } catch (_e) {
                // If parsing fails, treat as no stored value
            }
        }
        if (
            !hasStoredTranslation &&
            (!selected.translationUUID || selected.translationUUID === "UUID")
        ) {
            getTranslations(mushaf, 100, 0, "en").then((res) => {
                setSelected((prev) => ({
                    ...prev,
                    translationUUID: res[0].uuid,
                }));
            });
        }
    }, [selected.translationUUID, mounted, setSelected, mushaf]);

    if (!page) {
        return (
            <div className={className}>
                <div
                    style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "#666",
                    }}
                >
                    Page Not found!
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 bg-muted/50 rounded-2xl pb-6 lg:w-[60vw]">
            <FindBar
                takhtitsAyahsBreakers={takhtitsAyahsBreakers}
                surahs={surahs}
                ayahUuid={visible}
                onAyahSelect={(uuid) =>
                    setSelected((prev) => ({ ...prev, ayahUUID: uuid }))
                }
            />
            <div>
                <AyahsRange
                    offset={page?.offset ?? 0}
                    limit={page?.limit ?? 0}
                    mushaf={mushaf}
                    translationUuid={selected.translationUUID}
                    onLoad={onLoad}
                    mushafOptions={mushafOptions}
                    firstVisibleAyahChanged={(uuid) => {
                        setVisible((prev) => (prev !== uuid ? uuid : prev));
                    }}
                />
            </div>
        </div>
    );
}
