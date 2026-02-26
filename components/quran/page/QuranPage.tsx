"use client";

import { AyahBreakersResponse, Surah } from "@ntq/sdk";
import { AyahsRange } from "../AyahsRange";
import { useSelected } from "@/contexts/selectedsContext";
import { useMushafOptions } from "@/contexts/mushafOptionsContext";
import { usePlayOptions } from "@/contexts/playOptionsContext";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
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
    const [, setPlayOptions] = usePlayOptions();
    const lastJuzRef = useRef<number | undefined>(undefined);
    const lastHizbRef = useRef<number | undefined>(undefined);

    const setMountedEffect = useEffectEvent(() => setMounted(true));

    // Ensure we're on the client side before checking localStorage
    useEffect(() => {
        setMountedEffect();
    }, []);

    // Expose the current page's ayah UUIDs to the global play options context
    // so the audio component can implement page-repeat without extra data fetching.
    useEffect(() => {
        const start = page.offset;
        const end = page.offset + page.limit;
        const pageAyahUUIDs = takhtitsAyahsBreakers
            .slice(start, end)
            .map((ayah) => ayah.uuid);

        setPlayOptions((prev) => ({
            ...prev,
            pageAyahUUIDs,
        }));
    }, [page.offset, page.limit, takhtitsAyahsBreakers, setPlayOptions]);

    const juzToAyahUUIDs = useMemo(() => {
        const map = new Map<number, string[]>();
        for (const a of takhtitsAyahsBreakers) {
            if (typeof a.juz !== "number") continue;
            const list = map.get(a.juz);
            if (list) list.push(a.uuid);
            else map.set(a.juz, [a.uuid]);
        }
        return map;
    }, [takhtitsAyahsBreakers]);

    const hizbToAyahUUIDs = useMemo(() => {
        const map = new Map<number, string[]>();
        for (const a of takhtitsAyahsBreakers) {
            if (typeof a.hizb !== "number") continue;
            const list = map.get(a.hizb);
            if (list) list.push(a.uuid);
            else map.set(a.hizb, [a.uuid]);
        }
        return map;
    }, [takhtitsAyahsBreakers]);

    // Keep current juz/hizb UUID ranges updated for repeat-range playback.
    // Important: avoid spamming localStorage updates by only updating when the juz/hizb number changes.
    useEffect(() => {
        const anchorUUID = selected.ayahUUID ?? visible;
        if (!anchorUUID) return;

        const currentAyah = takhtitsAyahsBreakers.find(
            (a) => a.uuid === anchorUUID
        );
        if (!currentAyah) return;

        if (
            typeof currentAyah.juz === "number" &&
            currentAyah.juz !== lastJuzRef.current
        ) {
            lastJuzRef.current = currentAyah.juz;
            setPlayOptions((prev) => ({
                ...prev,
                juzAyahUUIDs: juzToAyahUUIDs.get(currentAyah.juz || 0) ?? [],
            }));
        }

        if (
            typeof currentAyah.hizb === "number" &&
            currentAyah.hizb !== lastHizbRef.current
        ) {
            lastHizbRef.current = currentAyah.hizb;
            setPlayOptions((prev) => ({
                ...prev,
                hizbAyahUUIDs: hizbToAyahUUIDs.get(currentAyah.hizb || 0) ?? [],
            }));
        }
    }, [
        visible,
        selected.ayahUUID,
        takhtitsAyahsBreakers,
        juzToAyahUUIDs,
        hizbToAyahUUIDs,
        setPlayOptions,
    ]);

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
        <div className="flex flex-col gap-3 bg-muted/50 rounded-3xl">
            <FindBar
                takhtitsAyahsBreakers={takhtitsAyahsBreakers}
                surahs={surahs}
                ayahUuid={visible}
                onAyahSelect={(uuid) =>
                    setSelected((prev) => ({ ...prev, ayahUUID: uuid }))
                }
            />
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
    );
}
