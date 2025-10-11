import { forwardRef } from "react";
import Link from "next/link";
import { SurahsListResponse } from "@ntq/sdk";
import { Button, ButtonProps } from "@yakad/ui";

interface RandomSurahButtonProps extends ButtonProps {
    surahList: SurahsListResponse;
}

export const RandomSurahButton = forwardRef<
    HTMLButtonElement,
    RandomSurahButtonProps
>(function RandomSurahButton({ surahList, children, ...restProps }, ref) {
    const surahLength = surahList.length;

    const randomNumber = Math.floor(Math.random() * surahLength);

    return (
        <Link
            href={`/quran?surah_uuid=${surahList[randomNumber].uuid}`}
        >
            <Button ref={ref} {...restProps}>
                {children || "Random Surah"}
            </Button>
        </Link>
    );
});
