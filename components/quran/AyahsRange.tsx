"use client";
import { useRef, useCallback } from "react";
import { getAyahs } from "@/app/actions/getAyahs";
import { Button } from "../ui/button";
import { Ayah as AyahType } from "@ntq/sdk";
import { useEffect, useState } from "react";
import { Ayah } from "./Ayah";
import { MushafOptions } from "@/contexts/mushafOptionsContext";
import { PaginatedAyahTranslationList } from "@ntq/sdk";
import { getTranslationAyahs } from "@/app/actions/getTranslations";
import { useSelected } from "@/contexts/selectedsContext";
import { ActiveOnVisible } from "../activeOnVisible/ActiveOnVisible";
import SurahHeader from "./SurahHeader";
import { Skeleton } from "../ui/skeleton";
import { AlertCircleIcon, RefreshCcwIcon } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Bismillah } from "@/components/quran/Bismillah";


interface AyahRangeProps {
    offset: number;
    limit: number;
    mushaf?: string;
    className?: string;
    translationUuid?: string;
    onLoad?: () => void;
    mushafOptions?: MushafOptions;
    firstVisibleAyahChanged: (uuid: string) => void;
}

export function AyahsRange({
    offset,
    limit,
    mushaf = "hafs",
    className,
    translationUuid,
    mushafOptions,
    onLoad,
    firstVisibleAyahChanged,
}: AyahRangeProps) {
    const [selected, setSelected] = useSelected();
    const [ayahs, setAyahs] = useState<AyahType[]>([]);
    const [translations, setTranslations] =
        useState<PaginatedAyahTranslationList>();
    const [loadingAyahs, setLoadingAyahs] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleAyahs, setVisibleAyahs] = useState<Set<number>>(new Set());
    const onLoadRef = useRef(onLoad);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onLoadRef.current = onLoad;
    }, [onLoad]);

    useEffect(() => {
        const first = Math.min(...visibleAyahs.keys());
        if (ayahs[first]) {
            firstVisibleAyahChanged(ayahs[first].uuid);
        }
    }, [visibleAyahs, ayahs, firstVisibleAyahChanged]);

    const ayahsRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Handle ayah click to update selected ayah
    const handleAyahClick = (ayahUUID: string) => {
        setSelected((prev) => ({
            ...prev,
            ayahUUID: ayahUUID,
        }));
    };

    // Scroll to selected ayah when it changes
    useEffect(() => {
        const selected_ayah = selected.ayahUUID ?? undefined;
        if (!selected_ayah) return;
        if (loadingAyahs) return;

        const ayahInRange = ayahs.some((ayah) => ayah.uuid === selected_ayah);
        if (!ayahInRange) return;

        let retries = 0;
        const maxRetries = 20;
        const tryScroll = () => {
            const el = ayahsRefs.current[selected_ayah];
            if (el) {
                requestAnimationFrame(() => {
                    const findBar = document.querySelector(
                        '[data-find-bar="true"]'
                    );
                    const findBarHeight = findBar
                        ? findBar.getBoundingClientRect().height
                        : 0;
                    const offset = 80 + findBarHeight + 20;

                    const elementTop =
                        el.getBoundingClientRect().top + window.scrollY;
                    const targetScroll = elementTop - offset;

                    window.scrollTo({
                        top: targetScroll,
                        behavior: "smooth",
                    });
                });
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(tryScroll, 100);
            }
        };
        const id = window.setTimeout(tryScroll, 300);
        return () => window.clearTimeout(id);
    }, [ayahs, selected.ayahUUID, loadingAyahs]);

    const loadAyahs = useCallback(async (isActive: boolean) => {
        try {
            setLoadingAyahs(true);
            setError(null);

            const loadedAyahs = await getAyahs(mushaf, limit, offset);

            if (!isActive) return;

            setAyahs(loadedAyahs.data);
            setLoadingAyahs(false);
            onLoadRef.current?.();
        } catch (err) {
            console.error("Error loading ayahs:", err);
            setError(`Failed to load ayahs ${err}`);
            setLoadingAyahs(false);
        }
    }, [limit, mushaf, offset]);

    useEffect(() => {
        let isActive = true;

        loadAyahs(isActive);

        return () => {
            isActive = false;
        };
    }, [offset, limit, mushaf, loadAyahs]);

    // Load translations separately - show when ready
    useEffect(() => {
        if (!translationUuid) {
            setTranslations(undefined);
            return;
        }

        let isActive = true;

        const loadTranslations = async () => {
            try {
                const loadedTranslations = await getTranslationAyahs(
                    translationUuid,
                    limit,
                    offset
                );

                if (!isActive) return;

                setTranslations(loadedTranslations);
            } catch (err) {
                console.error("Error loading translations:", err);
                // Don't set error for translations, just log it
            }
        };
        loadTranslations();

        return () => {
            isActive = false;
        };
    }, [offset, limit, translationUuid]);

    if (loadingAyahs) {
        return (
            <div className="flex flex-col gap-4 items-center p-5">
                <Skeleton className="h-[60px] w-full rounded-md" />
                <Skeleton className="h-[60px] w-full rounded-md" />
                <Skeleton className="h-[60px] w-full rounded-md" />
                <Skeleton className="h-[60px] w-full rounded-md" />
                <Skeleton className="h-[60px] w-full rounded-md" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={className}>
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Unable to load Ayahs!</AlertTitle>
                    <AlertDescription className="flex flex-col gap-3">
                        <p style={{ color: "red" }}>{error}</p>
                        <Button onClick={() => loadAyahs(true)} className="w-full">
                            <RefreshCcwIcon />
                            Reload
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (ayahs.length === 0) {
        return (
            <div className="flex items-center justify-center p-5">
                <p>No ayahs found in the specified range.</p>
            </div>
        );
    }

    const onVisibilityChange = (visible: boolean, index: number) => {
        if (visible) {
            setVisibleAyahs((set) => {
                if (set.has(index)) return set;
                return new Set(set).add(index);
            });
        } else {
            setVisibleAyahs((set) => {
                if (!set.has(index)) return set;
                const newSet = new Set(set);
                newSet.delete(index);
                return newSet;
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {ayahs.map((ayah, index) => (
                <div key={index}>
                    {ayah.surah &&
                        (index === 0 ||
                            ayahs[index - 1]?.surah?.uuid !==
                            ayah.surah.uuid) && (
                            <SurahHeader
                                surah={ayah.surah}
                                makkiMadani="makki"
                            />
                        )}
                    {ayah.surah?.bismillah?.is_ayah ?
                        (<ActiveOnVisible
                            onVisibilityChange={(visible) =>
                                onVisibilityChange(
                                    visible,
                                    index
                                )
                            }
                        >
                            <Ayah
                                number={1}
                                words={ayah.text.split(" ")}
                                id={`ayah-${ayah.uuid}`}
                                ref={(el) => {
                                    ayahsRefs.current[
                                        ayah.uuid
                                    ] = el;
                                }}
                                translationRtl={
                                    selected.translationRtl
                                }
                                mushafOptions={mushafOptions}
                                selected={
                                    ayah.uuid ===
                                    selected.ayahUUID
                                }
                                translationText={
                                    translations?.[index]?.text
                                }
                                bookmarked={selected.bookmarkedAyahUUID === ayah.uuid}
                                onBookmark={() => setSelected(prev => ({ ...prev, bookmarkedAyahUUID: prev.bookmarkedAyahUUID === ayah.uuid ? "UUID" : ayah.uuid }))}
                            />
                        </ActiveOnVisible>) :
                        ayah.number === 1 && ayah.surah?.bismillah?.text !== "" ? (
                            <Bismillah
                                id={`bismillah-${ayah.uuid}`}
                                words={ayah.surah?.bismillah?.text.split(" ") || []}
                                translationRtl={selected.translationRtl}
                                mushafOptions={mushafOptions}
                                translationText={translations?.[index]?.bismillah ?? undefined} />
                        ) : ""}

                    {!ayah.surah?.bismillah.is_ayah && (
                        <ActiveOnVisible
                            onVisibilityChange={(visible) =>
                                onVisibilityChange(visible, index)
                            }
                        >
                            <Ayah
                                ref={(el) => {
                                    ayahsRefs.current[ayah.uuid] = el;
                                }}
                                id={`ayah-${ayah.uuid}`}
                                number={ayah.number}
                                words={ayah.text.split(" ")}
                                translationText={translations?.[index].text}
                                translationRtl={selected.translationRtl}
                                mushafOptions={mushafOptions}
                                sajdah={ayah.sajdah || "none"}
                                selected={ayah.uuid === selected.ayahUUID}
                                bookmarked={selected.bookmarkedAyahUUID === ayah.uuid}
                                onBookmark={() => setSelected(prev => ({ ...prev, bookmarkedAyahUUID: prev.bookmarkedAyahUUID === ayah.uuid ? "UUID" : ayah.uuid }))}
                                onClick={() => handleAyahClick(ayah.uuid)}
                            />
                        </ActiveOnVisible>
                    )}
                </div>
            ))}
        </div>
    );
}
