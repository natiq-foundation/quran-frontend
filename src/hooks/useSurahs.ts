import { useState, useEffect } from "react"
import { getSurahs } from "@/api/surahs"
import type { Surah } from "@ntq/sdk"

export function getSurahNames(surah: Surah): { primary: string; secondary?: string } {
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

// Fetches the full surah list once per mushaf. Shared by the grid and the
// search overlay so both filter on the client without extra API calls.
export function useAllSurahs(mushaf: string) {
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

export function matchesQuery(surah: Surah, query: string): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true

    // allow matching by surah number (e.g. "2" or "36") in addition to name
    if (surah.number.toString().includes(q)) return true

    const { primary, secondary } = getSurahNames(surah)
    if (primary?.toLowerCase().includes(q)) return true
    if (secondary?.toLowerCase().includes(q)) return true

    return false
}