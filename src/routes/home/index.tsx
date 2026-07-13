import { useState, useEffect } from "react"
import { Material } from "@yakad/symbols"
import { useTranslation } from "react-i18next"
import ResponsiveMenu, { NavItem } from "@/components/modules/nav/ResponsiveNav"
import { SettingsDropdown } from "@/components/modules/settings/SettingsDropdown"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSurahs } from "@/api/surahs"
import type { Surah } from "@ntq/sdk"

type TabKey = "search" | "settings"

function getSurahNames(surah: Surah): { primary: string; secondary?: string } {
    const names = surah.names as unknown
    if (Array.isArray(names) && names.length > 0) {
        const first = names[0] as any
        return {
            primary: first?.name ?? first?.text ?? `Surah ${surah.number}`,
            secondary: first?.translation ?? first?.transliteration,
        }
    }
    if (names && typeof names === "object") {
        const n = names as any
        return {
            primary: n.arabic ?? n.name ?? `Surah ${surah.number}`,
            secondary: n.translation ?? n.transliteration,
        }
    }
    return { primary: `Surah ${surah.number}` }
}

function useSurahs(mushaf: string, searchTerm: string) {
    const [surahs, setSurahs] = useState<Surah[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        const timeoutId = setTimeout(async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getSurahs(mushaf, { search: searchTerm })
                if (!cancelled) setSurahs(data)
            } catch {
                if (!cancelled) setError("fetchError")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }, 300)

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
        }
    }, [mushaf, searchTerm])

    return { surahs, loading, error }
}

export default function Home() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<TabKey>("search")
    const [query, setQuery] = useState("")
    const { surahs, loading, error } = useSurahs("hafs", query)

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            <ResponsiveMenu open>
                <NavItem
                    icon={<Material icon="search" size={24} />}
                    label={t("common.search")}
                    active={activeTab === "search"}
                    onClick={() => setActiveTab("search")}
                />
                <NavItem
                    icon={<Material icon="settings" size={24} />}
                    label={t("common.settings")}
                    active={activeTab === "settings"}
                    onClick={() => setActiveTab("settings")}
                />
            </ResponsiveMenu>

            <main className="md:ml-24 p-4">
                {activeTab === "search" && (
                    <div className="max-w-xl mx-auto flex flex-col gap-4">
                        {/* سرچ بار - مستقل از لیست */}
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

                        {/* لیست سوره‌ها */}
                        <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden py-0 gap-0">
                            <ScrollArea className="h-[65vh]">
                                <CardContent className="p-2">
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

                                    {!loading && !error && surahs.length === 0 && (
                                        <div className="py-10 text-center text-sm text-muted-foreground">
                                            {t("common.noResults")}
                                        </div>
                                    )}

                                    {!loading &&
                                        !error &&
                                        surahs.map((surah) => {
                                            const { primary, secondary } = getSurahNames(surah)
                                            return (
                                                <div
                                                    key={surah.uuid}
                                                    className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent transition-colors cursor-pointer"
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
                                </CardContent>
                            </ScrollArea>
                        </Card>
                    </div>
                )}

                {activeTab === "settings" && (
                    <Card className="max-w-sm mx-auto mt-4">
                        <CardContent className="p-2">
                            <SettingsDropdown />
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}