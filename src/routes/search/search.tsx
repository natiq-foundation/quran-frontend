import { useState } from "react"
import SurahSearchOverlay from "./SurahSearchOverlay"
import SurahGrid from "./SurahGrid"
import { useAllSurahs } from "@/hooks/useSurahs"

export default function Search() {
    const [searchOpen, setSearchOpen] = useState(false)
    const { surahs, loading, error } = useAllSurahs("hafs")

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <SurahSearchOverlay
                surahs={surahs}
                loading={loading}
                error={error}
                onOpenChange={setSearchOpen}
            />
            <SurahGrid
                surahs={surahs}
                loading={loading}
                error={error}
                blurred={searchOpen}
            />
        </div>
    )
}