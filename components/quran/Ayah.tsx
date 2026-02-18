"use client";

import { MushafOptions } from "@/contexts/mushafOptionsContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { useCallback, useState } from "react";
import { useOnRightClick, useOnOutsideClick } from "@yakad/use-interactions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Material } from "@yakad/symbols";

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
    bookmarked?: boolean;
    onBookmark?: () => void;
    ref?: React.Ref<HTMLDivElement>;
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
    bookmarked = false,
    onBookmark,
    ref,
}: AyahProps) {
    const [dropdownMenu, setDropdownMenu] = useState(false);
    const r = useOnRightClick<HTMLDivElement>((e) => setDropdownMenu(true));
    const outsideRef = useOnOutsideClick<HTMLDivElement>((e) => setDropdownMenu(false));

    const assignRef = useCallback(
        <T,>(ref: React.Ref<T> | undefined, value: T) => {
            if (!ref) return;
            if (typeof ref === "function") {
                ref(value);
            } else {
                // mutable ref object
                (ref as React.MutableRefObject<T>).current = value;
            }
        },
        []
    );

    const setClickableRefs = useCallback(
        (node: HTMLDivElement | null) => {
            // keep the right-click handler working (@yakad/use-interactions returns a ref object)
            (r as React.MutableRefObject<HTMLDivElement | null>).current = node;
            // expose node for parent (AyahsRange) scroll-to-selected
            assignRef(ref, node);
        },
        [r, ref, assignRef]
    );

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
        <div ref={outsideRef}>
            <DropdownMenu open={dropdownMenu}>
                <DropdownMenuTrigger asChild>
                    <div
                        ref={setClickableRefs}
                        id={id}
                        onClick={onClick}
                        className={cn(
                            "flex flex-col gap-3 p-5 hover:bg-accent/80 rounded-3xl transition-all cursor-pointer",
                            selected && "bg-muted",
                            bookmarked ? "border-r-4 border-r-primary" : ""
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
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Ayah Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onBookmark}>
                        {!bookmarked ? (
                            <>
                                <Material icon="bookmark_add" />
                                Bookmark
                            </>
                        ) : (
                            <>
                                <Material icon="bookmark_remove" />
                                Remove bookmark
                            </>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
