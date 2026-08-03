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

// Flattens EVERY language variant returned for a surah (arabic name,
// per-locale translation, transliteration, etc.) into a single lowercase
// list, so search works no matter which language the user types in.
function getAllSearchableStrings(surah: Surah): string[] {
    const values: string[] = []
    const names = surah.names as unknown

    const pushIfString = (v: unknown) => {
        if (typeof v === "string" && v.trim()) values.push(v.toLowerCase())
    }

    if (Array.isArray(names)) {
        for (const entry of names) {
            if (!entry || typeof entry !== "object") continue
            const e = entry as Record<string, unknown>
            pushIfString(e.name)
            pushIfString(e.text)
            pushIfString(e.arabic)
            pushIfString(e.translation)
            pushIfString(e.transliteration)
        }
    } else if (names && typeof names === "object") {
        const n = names as Record<string, unknown>
        pushIfString(n.arabic)
        pushIfString(n.name)
        pushIfString(n.translation)
        pushIfString(n.transliteration)
    }

    return values
}

export function matchesQuery(surah: Surah, query: string): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true

    // allow matching by surah number (e.g. "2" or "36")
    if (surah.number.toString().includes(q)) return true

    return getAllSearchableStrings(surah).some((value) => value.includes(q))
}

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