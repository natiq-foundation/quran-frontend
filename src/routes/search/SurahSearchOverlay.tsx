import { useState, useEffect, useMemo } from "react"
import { Material } from "@yakad/symbols"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSurahNames, matchesQuery } from "@/hooks/useSurahs"
import type { Surah } from "@ntq/sdk"

const PAGE_SIZE = 9

interface SurahSearchOverlayProps {
    surahs: Surah[]
    loading: boolean
    error: string | null
    onOpenChange?: (open: boolean) => void
    onSelect?: (surah: Surah) => void
}


export default function SurahSearchOverlay({
    surahs,
    loading,
    error,
    onOpenChange,
    onSelect,
}: SurahSearchOverlayProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")
    const [expandedByUser, setExpandedByUser] = useState(false)

    const filtered = useMemo(() => surahs.filter((s) => matchesQuery(s, query)), [surahs, query])


    const isOpen = query.trim().length > 0

    const expanded = query.trim() === "" && expandedByUser

    useEffect(() => {
        onOpenChange?.(isOpen)
    }, [isOpen, onOpenChange])

    const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE)
    const hasMore = filtered.length > PAGE_SIZE

    return (
        <div className="relative max-w-xl w-full mx-auto z-30">
            <div className="relative">
                <Material
                    icon="search"
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("common.searchSurah")}
                    className="h-12 rounded-2xl pl-10 text-base shadow-sm"
                />
            </div>

            {isOpen && (
                <Card className="absolute top-full mt-2 left-0 right-0 rounded-2xl border-border/60 shadow-xl py-0 gap-0 overflow-hidden backdrop-blur-md bg-background/95">
                    <CardContent className="p-2 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                        {loading && (
                            <div className="flex flex-col gap-2 p-1">
                                <Skeleton className="w-full h-14 rounded-xl" />
                                <Skeleton className="w-full h-14 rounded-xl" />
                                <Skeleton className="w-full h-14 rounded-xl" />
                            </div>
                        )}

                        {!loading && error && (
                            <div className="py-10 text-center text-sm text-destructive">
                                {t("common.fetchError")}
                            </div>
                        )}

                        {!loading && !error && filtered.length === 0 && (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                {t("common.noResults")}
                            </div>
                        )}

                        {!loading && !error && filtered.length > 0 && (
                            <>
                                {visible.map((surah) => {
                                    const { primary, secondary } = getSurahNames(surah)
                                    return (
                                        <div
                                            key={surah.id}
                                            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent transition-colors cursor-pointer"
                                            onClick={() => onSelect?.(surah)}
                                        >
                                            <Badge
                                                variant="secondary"
                                                className="h-8 w-8 shrink-0 rounded-full p-0 flex items-center justify-center text-xs font-medium tabular-nums"
                                            >
                                                {surah.number}
                                            </Badge>

                                            <div className="flex flex-col min-w-0">
                                                <span
                                                    dir="rtl"
                                                    className="text-lg font-semibold leading-tight truncate"
                                                >
                                                    {primary}
                                                </span>
                                                {secondary && (
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {secondary}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

                                {hasMore && (
                                    <div className="flex justify-center pt-1 pb-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={() => setExpandedByUser((v) => !v)}
                                        >
                                            {expanded ? t("common.showLess") : t("common.showMore")}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}