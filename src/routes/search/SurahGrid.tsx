import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSurahNames, matchesQuery } from "@/hooks/useSurahs"
import { Symbol } from "@yakad/symbols"
import type { Surah } from "@ntq/sdk"

interface SurahGridProps {
    surahs: Surah[]
    loading: boolean
    error: string | null
    query?: string
    onSelect?: (surah: Surah) => void
}

function RevelationBadge({ period }: { period: Surah["period"] }) {
    if (period !== "makki" && period !== "madani") {
        return null
    }

    const isMakki = period === "makki"

    return (
        <div className="flex items-center justify-center h-7 w-7 shrink-0 text-black dark:text-white [&_svg]:fill-current [&_svg_*]:fill-current">
            <Symbol icon={isMakki ? "MakkahOutlined" : "MadinehOutlined"} filled />
        </div>
    )
}

export default function SurahGrid({
    surahs,
    loading,
    error,
    query = "",
    onSelect,
}: SurahGridProps) {
    const { t } = useTranslation()

    const filtered = useMemo(
        () => surahs.filter((s) => matchesQuery(s, query)),
        [surahs, query]
    )

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-32 rounded-2xl" />
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-16 text-center text-sm text-destructive">
                {t("common.fetchError")}
            </div>
        )
    }

    if (filtered.length === 0) {
        return (
            <div className="py-16 text-center text-sm text-muted-foreground">
                {t("common.noResults")}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((surah) => {
                const { primary, secondary } = getSurahNames(surah)

                return (
                    <Card
                        key={surah.id}
                        className="rounded-2xl border-border/60 shadow-sm hover:shadow-md hover:bg-accent/60 transition-all cursor-pointer py-0"
                        onClick={() => onSelect?.(surah)}
                    >
                        <CardContent className="flex flex-col gap-4 p-5">
                            <div className="flex items-center justify-between">
                                <RevelationBadge period={surah.period} />

                                <Badge
                                    variant="secondary"
                                    className="h-7 min-w-7 shrink-0 rounded-full px-2 flex items-center justify-center text-xs font-medium tabular-nums"
                                >
                                    {surah.number}
                                </Badge>
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span dir="rtl" className="text-xl font-semibold leading-tight truncate">
                                    {primary}
                                </span>

                                {secondary && (
                                    <span className="text-sm text-muted-foreground/60 truncate">
                                        {secondary}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}