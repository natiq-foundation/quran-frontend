"use client";

import { MushafOptions } from "@/contexts/mushafOptionsContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Ref } from "react";

export interface AyahProps {
    words: string[];
    id: string;
    number: number;
    sajdah?: string;
    selected?: boolean;
    translationText?: string;
    mushafOptions?: MushafOptions;
    translationRtl?: boolean;
    onClick?: () => void;
    ref: Ref<HTMLDivElement>;
}

export function Ayah({
    words,
    id,
    translationText,
    translationRtl,
    onClick,
    selected,
    number,
    mushafOptions,
    ref,
}: AyahProps) {
    const arabicFontSizeClass = {
        small: "text-xl/9",
        medium: "text-2xl/10",
        large: "text-4xl/15",
    }[mushafOptions?.arabicFontSize ?? "medium"];

    const translationFontSizeClass = {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
    }[mushafOptions?.translationFontSize ?? "medium"];

    const textAlignClass =
        mushafOptions?.textAlign === "center" ? "text-justify [text-align-last:center]" : "text-right";

    const translationAlignClass =
        mushafOptions?.textAlign === "center"
            ? "text-justify [text-align-last:center]"
            : translationRtl
                ? "text-right"
                : "text-left";
    return (
        <div
            ref={ref}
            id={id}
            onClick={onClick}
            className={cn(
                "flex flex-col gap-3 p-5 hover:bg-accent/80 rounded-2xl transition-all cursor-pointer",
                selected && "bg-accent"
            )}
        >
            <div dir="rtl" className={cn(arabicFontSizeClass, textAlignClass)}>
                {words.map((w, i) => (
                    <span key={i}>{w} </span>
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
                {(mushafOptions?.translationVisibility && translationText) ?? (
                    <Skeleton className="h-[30px] w-[300px] rounded-md" />
                )}
            </div>
        </div>
    );
}
