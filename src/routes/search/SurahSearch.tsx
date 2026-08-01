import { useState, useEffect, useMemo } from "react"
import { Material } from "@yakad/symbols"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getSurahs } from "@/api/surahs"
import type { Surah } from "@ntq/sdk"

const PAGE_SIZE = 9

function getSurahNames(surah: Surah): { primary: string; secondary?: string } {
    const names = surah.names as unknown
    if (Array.isArray(names) && names.length > 0) {
        const first = names[0] as Record<string, unknown>
        return {
            primary:
                typeof first.name === "string"
                    ? first.name
                    : typeof first.text === "string"
                        ? first.text
                        : `Surah ${surah.number}`,

            secondary:
                typeof first.translation === "string"
                    ? first.translation
                    : typeof first.transliteration === "string"
                        ? first.transliteration
                        : undefined,
        }
    }
    if (names && typeof names === "object") {
        const n = names as Record<string, unknown>
        return {
            primary:
                typeof n.arabic === "string"
                    ? n.arabic
                    : typeof n.name === "string"
                        ? n.name
                        : `Surah ${surah.number}`,

            secondary:
                typeof n.translation === "string"
                    ? n.translation
                    : typeof n.transliteration === "string"
                        ? n.transliteration
                        : undefined,
        }
    }
    return { primary: `Surah ${surah.number}` }
}

// Fetches the full surah list once per mushaf so that filtering (including by
// number) can happen entirely on the client, instantly and without re-hitting
// the API on every keystroke.
function useAllSurahs(mushaf: string) {
    const [surahs, setSurahs] = useState<Surah[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        getSurahs(mushaf, { search: "" })
            .then((data) => {
                if (!cancelled) setSurahs(data)
            })
            .catch(() => {
                if (!cancelled) setError("fetchError")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [mushaf])

    return { surahs, loading, error }
}

function matchesQuery(surah: Surah, query: string): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true

    // allow matching by surah number (e.g. "2" or "36") in addition to name
    if (surah.number.toString().includes(q)) return true

    const { primary, secondary } = getSurahNames(surah)
    if (primary?.toLowerCase().includes(q)) return true
    if (secondary?.toLowerCase().includes(q)) return true

    return false
}

interface SurahSearchProps {
    mushaf?: string
    onSelect?: (surah: Surah) => void
}

export default function SurahSearch({ mushaf = "hafs", onSelect }: SurahSearchProps) {
    const { t } = useTranslation()
    const [query, setQuery] = useState("")
    const [focused, setFocused] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const { surahs, loading, error } = useAllSurahs(mushaf)

    const filtered = useMemo(() => surahs.filter((s) => matchesQuery(s, query)), [surahs, query])

    // collapse back to the short list whenever the search term changes
    useEffect(() => {
        setExpanded(false)
    }, [query])

    const isOpen = focused || query.length > 0
    const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE)
    const hasMore = filtered.length > PAGE_SIZE

    return (
        <div className="max-w-xl w-full mx-auto flex flex-col gap-2">
            <div className="relative">
                <Material
                    icon="search"
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    // delay so a click on a result row registers before the card closes
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    placeholder={t("common.searchSurah")}
                    className="h-12 rounded-2xl pl-10 text-base shadow-sm"
                />
            </div>

            {isOpen && (
                <Card className="rounded-2xl border-border/60 shadow-sm py-0 gap-0 overflow-hidden">
                    <CardContent className="p-2 flex flex-col gap-2">
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
                                            onClick={() => setExpanded((v) => !v)}
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