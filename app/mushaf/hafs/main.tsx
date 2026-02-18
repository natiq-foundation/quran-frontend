import Mushaf from "@/components/quran/Mushaf";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Main({ mushaf }: { mushaf: string }) {
    return (
        <main className="pt-6 pb-6 pr-4 pl-4 flex flex-col items-center justify-center gap-2 w-full min-h-[calc(100vh-8rem)]">
            <Suspense fallback={
                <>
                    <Skeleton className="w-3xl h-60 mb-auto" />
                    <Skeleton className="w-3xl h-60 mb-auto" />
                </>
            }>
                <Mushaf name={mushaf} />
            </Suspense>
        </main>
    );
}
