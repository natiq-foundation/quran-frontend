import { useState } from "react"
import { Material } from "@yakad/symbols"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"

interface SurahSearchOverlayProps {
    onQueryChange?: (query: string) => void
}

export default function SurahSearchOverlay({ onQueryChange }: SurahSearchOverlayProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")

    const handleChange = (value: string) => {
        setQuery(value)
        onQueryChange?.(value)
    }

    return (
        <div className="relative max-w-xl w-full mx-auto">
            <Material
                icon="search"
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={t("common.searchSurah")}
                className="h-12 rounded-2xl pl-10 text-base shadow-sm"
            />
        </div>
    )
}