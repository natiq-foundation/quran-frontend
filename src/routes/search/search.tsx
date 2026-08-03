import { useState } from "react"
import SurahSearchOverlay from "./SurahSearchOverlay"
import SurahGrid from "./SurahGrid"
import { useAllSurahs } from "@/hooks/useSurahs"

export default function Search() {
    const [query, setQuery] = useState("")
    const { surahs, loading, error } = useAllSurahs("hafs")

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
            <SurahSearchOverlay onQueryChange={setQuery} />
            <SurahGrid surahs={surahs} loading={loading} error={error} query={query} />
        </div>
    )
}