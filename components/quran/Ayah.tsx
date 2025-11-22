"use client";
import { forwardRef, useEffect, useRef } from "react";
import { MushafOptions } from "@/contexts/mushafOptionsContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useSelected } from "@/contexts/selectedsContext";

export interface AyahProps {
    words: { uuid: string; text: string }[];
    id: string;
    number: number;
    sajdah?: string;
    selected?: boolean;
    translationText?: string;
    mushafOptions?: MushafOptions;
    translationRtl?: boolean;
    onClick?: () => void;
}

export const Ayah = forwardRef<HTMLDivElement, AyahProps>(
    (
        {
            words,
            id,
            translationText,
            translationRtl,
            onClick,
            selected,
            number,
            mushafOptions,
        },
        ref
    ) => {
        const [select] = useSelected();
        const arabicFontSizeClass = {
            small: "text-xl",
            medium: "text-2xl",
            large: "text-4xl",
        }[mushafOptions?.arabicFontSize ?? "medium"];

        const translationFontSizeClass = {
            small: "text-sm",
            medium: "text-base",
            large: "text-lg",
        }[mushafOptions?.translationFontSize ?? "medium"];

        const textAlignClass =
            mushafOptions?.textAlign === "center"
                ? "text-center"
                : "text-right";

        const translationAlignClass =
            mushafOptions?.textAlign === "center"
                ? "text-center"
                : translationRtl
                ? "text-right"
                : "text-left";
        const wordsRefs = useRef<Record<string, HTMLSpanElement | null>>({});

        useEffect(() => {
            const selected_ayah = select.wordUUID ?? undefined;
            if (!selected_ayah) return;

            const ayahInRange = words.some(
                (word) => word.uuid === selected_ayah
            );
            if (!ayahInRange) return;

            let retries = 0;
            const maxRetries = 20;
            const tryScroll = () => {
                const el = wordsRefs.current[selected_ayah];
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
        }, [words, select.wordUUID]);

        return (
            <div
                ref={ref}
                id={id}
                onClick={onClick}
                className={cn(
                    "flex flex-col gap-3 p-5 hover:bg-neutral-800/50 rounded-md transition-all",
                    selected && "bg-neutral-800/50"
                )}
            >
                <div
                    dir="rtl"
                    className={cn(arabicFontSizeClass, textAlignClass)}
                >
                    {words.map((w, i) => (
                        <span
                            key={i}
                            ref={(el) => {
                                wordsRefs.current[w.uuid] = el;
                            }}
                        >
                            {w.text}{" "}
                        </span>
                    ))}
                    ({number})
                </div>
                <div
                    dir={translationRtl ? "rtl" : "ltr"}
                    className={cn(
                        "opacity-85",
                        translationFontSizeClass,
                        translationAlignClass
                    )}
                >
                    {translationText ?? (
                        <Skeleton className="h-[30px] w-[300px] rounded-md" />
                    )}
                </div>
            </div>
        );
    }
);

Ayah.displayName = "Ayah";
