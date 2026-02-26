"use client";

import { getRecitation } from "@/app/actions/getRecitation";
import { getSurah } from "@/app/actions/getSurahs";
import { usePlayOptions } from "@/contexts/playOptionsContext";
import { useSelected } from "@/contexts/selectedsContext";
import { SurahDetail } from "@ntq/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function Audio(
    restProps: Omit<React.HTMLAttributes<HTMLAudioElement>, "style">
) {
    const [selected, setSelected] = useSelected();
    const [playOptions, setPlayOptions] = usePlayOptions();
    const isPlaying = playOptions.playing;

    const playBackActive = playOptions.playBackActive;
    const playBackRate = playOptions.playBackRate;
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [recitationFileUrl, setRecitationFileUrl] = useState<string>();
    const [recitationSurahs, setRecitationSurahs] = useState<
        {
            file_url: string;
            surah_uuid: string;
        }[]
    >([]);
    const [currentSurahIndex, setCurrentSurahIndex] = useState(0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wordsTimestamps, setWordsTimestamps] = useState<any>([]);
    const [ayahsTimestamps, setAyahsTimestamps] = useState<string[]>([]);
    const [currentSurah, setCurrentSurah] = useState<SurahDetail>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [surahAyahs, setSurahAyahs] = useState<any[]>([]);
    const [wordsTimestampsBySurah, setWordsTimestampsBySurah] = useState<
        Record<
            string,
            {
                start: string;
                end: string;
                word_uuid: string;
            }[]
        >
    >({});
    const [ayahsTimestampsBySurah, setAyahsTimestampsBySurah] = useState<
        Record<string, string[]>
    >({});
    // Track the last ayah UUID set by the timeupdate handler to avoid loops
    const lastAyahFromTimeUpdate = useRef<string | undefined>(undefined);

    // Keep latest values accessible inside event handlers without re-binding them.
    const repeatModeRef = useRef(playOptions.repeatMode);
    const repeatRangeRef = useRef(playOptions.repeatRange);
    const selectedAyahUUIDRef = useRef<string | undefined>(selected.ayahUUID);
    const pageAyahUUIDsRef = useRef<string[] | undefined>(
        playOptions.pageAyahUUIDs
    );
    const juzAyahUUIDsRef = useRef<string[] | undefined>(
        playOptions.juzAyahUUIDs
    );
    const hizbAyahUUIDsRef = useRef<string[] | undefined>(
        playOptions.hizbAyahUUIDs
    );
    const playingRef = useRef(isPlaying);

    useEffect(() => {
        repeatModeRef.current = playOptions.repeatMode;
        repeatRangeRef.current = playOptions.repeatRange;
        selectedAyahUUIDRef.current = selected.ayahUUID;
        pageAyahUUIDsRef.current = playOptions.pageAyahUUIDs;
        juzAyahUUIDsRef.current = playOptions.juzAyahUUIDs;
        hizbAyahUUIDsRef.current = playOptions.hizbAyahUUIDs;
        playingRef.current = isPlaying;
    }, [
        playOptions.repeatMode,
        playOptions.repeatRange,
        playOptions.pageAyahUUIDs,
        playOptions.juzAyahUUIDs,
        playOptions.hizbAyahUUIDs,
        selected.ayahUUID,
        isPlaying,
    ]);

    const timestampToSeconds = (timestamp: string): number => {
        const [hours, minutes, seconds] = timestamp.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    const getAyahSegmentSeconds = useCallback(
        (ayahUUID: string | undefined) => {
            if (!audioRef.current || !ayahUUID) return null;
            if (ayahsTimestamps.length === 0 || surahAyahs.length === 0)
                return null;

            const index = surahAyahs.findIndex((a) => a.uuid === ayahUUID);
            if (index === -1) return null;

            const start =
                index === 0
                    ? 0
                    : timestampToSeconds(ayahsTimestamps[index - 1]);

            const duration = Number.isFinite(audioRef.current.duration)
                ? audioRef.current.duration
                : undefined;

            const end =
                index >= surahAyahs.length - 1
                    ? duration
                    : timestampToSeconds(ayahsTimestamps[index]);

            if (end === undefined) {
                return { start, end: Number.POSITIVE_INFINITY };
            }
            if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
            if (end <= start) return null;

            // Trim a little from the end of the ayah so the repeat
            // feels tighter and doesn't leak into the next ayah.
            const trimFromEnd = 0.4; // seconds
            const logicalEnd = Math.max(start, end - trimFromEnd);

            return { start, end: logicalEnd };
        },
        [ayahsTimestamps, surahAyahs]
    );

    const getAyahsSegmentSeconds = useCallback(
        (ayahUUIDs: string[] | undefined) => {
            if (!audioRef.current || !ayahUUIDs || ayahUUIDs.length === 0)
                return null;
            if (ayahsTimestamps.length === 0 || surahAyahs.length === 0)
                return null;

            // Map the provided ayahs to indices within the currently loaded surah ayahs
            const indices = ayahUUIDs
                .map((uuid) => surahAyahs.findIndex((a) => a.uuid === uuid))
                .filter((i) => i >= 0)
                .sort((a, b) => a - b);

            if (indices.length === 0) return null;

            const firstIndex = indices[0];
            const lastIndex = indices[indices.length - 1];

            const start =
                firstIndex === 0
                    ? 0
                    : timestampToSeconds(ayahsTimestamps[firstIndex - 1]);

            const duration = Number.isFinite(audioRef.current.duration)
                ? audioRef.current.duration
                : undefined;

            const end =
                lastIndex >= surahAyahs.length - 1
                    ? duration
                    : timestampToSeconds(ayahsTimestamps[lastIndex]);

            if (end === undefined) {
                return { start, end: Number.POSITIVE_INFINITY };
            }
            if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
            if (end <= start) return null;

            // Trim a bit from the end so the repeat feels tight
            const trimFromEnd = 0.4;
            const logicalEnd = Math.max(start, end - trimFromEnd);

            return {
                start,
                end: logicalEnd,
                firstUUID: surahAyahs[firstIndex]?.uuid as string | undefined,
            };
        },
        [ayahsTimestamps, surahAyahs]
    );

    useEffect(() => {
        if (selected.recitationUUID && selected.recitationUUID !== "UUID") {
            // Set loading to true when starting to fetch data
            setPlayOptions((prev) => ({ ...prev, loading: true }));

            getRecitation(selected.recitationUUID)
                .then(async (res) => {
                    const recitationData = res as unknown as {
                        recitation_surahs: {
                            file_url: string;
                            surah_uuid: string;
                        }[];
                        words_timestamps: {
                            surah: string;
                            timestamps: {
                                start: string;
                                end: string;
                                word_uuid: string;
                            }[];
                        }[];
                        ayahs_timestamps: {
                            surah: string;
                            timestamps: string[];
                        }[];
                    };

                    const recSurahs = recitationData.recitation_surahs || [];
                    if (!recSurahs.length) {
                        throw new Error("Recitation surahs are empty");
                    }

                    setRecitationSurahs(recSurahs);
                    setCurrentSurahIndex(0);

                    const wordsBySurah: Record<
                        string,
                        {
                            start: string;
                            end: string;
                            word_uuid: string;
                        }[]
                    > = {};
                    (recitationData.words_timestamps || []).forEach((wt) => {
                        wordsBySurah[wt.surah] = wt.timestamps || [];
                    });
                    setWordsTimestampsBySurah(wordsBySurah);

                    const ayahsBySurah: Record<string, string[]> = {};
                    (recitationData.ayahs_timestamps || []).forEach((at) => {
                        ayahsBySurah[at.surah] = at.timestamps || [];
                    });
                    setAyahsTimestampsBySurah(ayahsBySurah);
                })
                .catch((error) => {
                    console.error("Error loading recitation:", error);
                    setPlayOptions((prev) => ({ ...prev, loading: false }));
                });
        } else {
            // Reset loading state if no recitation is selected
            setPlayOptions((prev) => ({ ...prev, loading: false }));
            setRecitationSurahs([]);
            setCurrentSurahIndex(0);
            setWordsTimestamps([]);
            setAyahsTimestamps([]);
            setWordsTimestampsBySurah({});
            setAyahsTimestampsBySurah({});
            setCurrentSurah(undefined);
            setSurahAyahs([]);
        }
    }, [selected.recitationUUID, setPlayOptions]);

    // Load current surah data (file URL + timestamps + ayahs) whenever
    // recitationSurahs, currentSurahIndex, or timestamp maps change.
    useEffect(() => {
        const currentMeta = recitationSurahs[currentSurahIndex];
        if (!currentMeta) return;

        const surahUuid = currentMeta.surah_uuid;

        setRecitationFileUrl(currentMeta.file_url);
        setWordsTimestamps(wordsTimestampsBySurah[surahUuid] || []);
        setAyahsTimestamps(ayahsTimestampsBySurah[surahUuid] || []);

        // Reset the ref when surah changes
        lastAyahFromTimeUpdate.current = undefined;

        if (surahUuid) {
            getSurah(surahUuid)
                .then((surah) => {
                    setCurrentSurah(surah);
                    if (surah.ayahs && Array.isArray(surah.ayahs)) {
                        setSurahAyahs(surah.ayahs);
                    } else {
                        setSurahAyahs([]);
                    }
                })
                .catch((error) => {
                    console.error("Error loading surah details:", error);
                    setCurrentSurah(undefined);
                    setSurahAyahs([]);
                });
        }
    }, [
        recitationSurahs,
        currentSurahIndex,
        wordsTimestampsBySurah,
        ayahsTimestampsBySurah,
    ]);

    // Handle audio loading events
    useEffect(() => {
        if (!audioRef.current || !recitationFileUrl) return;

        const audio = audioRef.current;

        const handleLoadStart = () => {
            setPlayOptions((prev) => ({ ...prev, loading: true }));
        };

        const handleCanPlayThrough = () => {
            setPlayOptions((prev) => ({ ...prev, loading: false }));
        };

        const handleError = () => {
            // Ignore abort errors that happen when we intentionally
            // change the audio src to the next surah.
            const mediaError = audio.error;
            if (mediaError && mediaError.code === 1) {
                // MEDIA_ERR_ABORTED: do not treat as a real error
                setPlayOptions((prev) => ({ ...prev, loading: false }));
                return;
            }

            setPlayOptions((prev) => ({ ...prev, loading: false }));
        };

        // Check if audio is already loaded
        if (audio.readyState >= 3) {
            // HAVE_FUTURE_DATA or higher means audio is ready
            setPlayOptions((prev) => ({ ...prev, loading: false }));
        }

        audio.addEventListener("loadstart", handleLoadStart);
        audio.addEventListener("canplaythrough", handleCanPlayThrough);
        audio.addEventListener("error", handleError);

        return () => {
            audio.removeEventListener("loadstart", handleLoadStart);
            audio.removeEventListener("canplaythrough", handleCanPlayThrough);
            audio.removeEventListener("error", handleError);
        };
    }, [setPlayOptions, recitationFileUrl]);

    useEffect(() => {
        if (!audioRef.current) return;
        if (ayahsTimestamps.length <= 0) {
            toast.error("Current recitation is not complete please switch to another one!");
            return;
        };

        // Don't start/adjust playback while loading to avoid play/pause races.
        if (playOptions.loading) {
            return;
        }

        if (isPlaying) {
            console.log(wordsTimestamps);
            if (wordsTimestamps.length >= 1) {
                setSelected((prev) => ({
                    ...prev,
                    wordUUID: wordsTimestamps[0].word_uuid,
                }));
            }
            audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error);
                setPlayOptions((prev) => ({ ...prev, playing: false }));
            });
        } else {
            audioRef.current.pause();
        }
    }, [
        ayahsTimestamps.length,
        isPlaying,
        setSelected,
        wordsTimestamps,
        playOptions.loading,
        setPlayOptions,
    ]);

    useEffect(() => {
        if (
            !audioRef.current ||
            ayahsTimestamps.length === 0 ||
            surahAyahs.length === 0
        ) {
            return;
        }

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            const currentTime = audio.currentTime;

            setPlayOptions((prev) => ({
                ...prev,
                progress: (audio.currentTime / audio.duration) * 100,
            }));

            let ayahIndex = 0;

            for (let i = 0; i < ayahsTimestamps.length; i++) {
                const timestampSeconds = timestampToSeconds(ayahsTimestamps[i]);
                if (currentTime >= timestampSeconds) {
                    ayahIndex = i + 1;
                } else {
                    break;
                }
            }

            if (ayahIndex < surahAyahs.length && surahAyahs[ayahIndex]) {
                const newAyahUUID = surahAyahs[ayahIndex].uuid;
                const repeatMode = repeatModeRef.current;
                const lockedAyahUUID = selectedAyahUUIDRef.current;

                if (repeatMode === "ayah") {
                    // If user didn't explicitly pick an ayah, lock to the currently-playing one.
                    const effectiveAyahUUID = lockedAyahUUID ?? newAyahUUID;
                    if (selectedAyahUUIDRef.current !== effectiveAyahUUID) {
                        selectedAyahUUIDRef.current = effectiveAyahUUID;
                    }
                    lastAyahFromTimeUpdate.current = effectiveAyahUUID;
                    setSelected((prev) => ({
                        ...prev,
                        ayahUUID: effectiveAyahUUID,
                    }));
                } else {
                    // Normal continuous playback: keep selected ayah in sync with audio.
                    lastAyahFromTimeUpdate.current = newAyahUUID;
                    selectedAyahUUIDRef.current = newAyahUUID;
                    setSelected((prev) => ({
                        ...prev,
                        ayahUUID: newAyahUUID,
                    }));
                }
            }

            // Loop the current ayah segment when repeatMode is "ayah".
            if (repeatModeRef.current === "ayah") {
                const segment = getAyahSegmentSeconds(selectedAyahUUIDRef.current);
                if (segment) {
                    const effectiveEnd = Number.isFinite(segment.end)
                        ? segment.end
                        : Number.isFinite(audio.duration)
                            ? audio.duration
                            : undefined;

                    if (
                        effectiveEnd !== undefined &&
                        currentTime >= effectiveEnd
                    ) {
                        audio.currentTime = segment.start;
                        if (playingRef.current) {
                            audio.play().catch(() => { });
                        }
                    }
                }
            }

            // Loop the current mushaf page when repeatMode is "range" and repeatRange is "page".
            if (
                repeatModeRef.current === "range" &&
                (repeatRangeRef.current === "page" ||
                    repeatRangeRef.current === "juz" ||
                    repeatRangeRef.current === "hizb")
            ) {
                const range = repeatRangeRef.current;
                const ayahUUIDs =
                    range === "page"
                        ? pageAyahUUIDsRef.current
                        : range === "juz"
                            ? juzAyahUUIDsRef.current
                            : hizbAyahUUIDsRef.current;

                const segment = getAyahsSegmentSeconds(ayahUUIDs);
                if (segment) {
                    const effectiveEnd = Number.isFinite(segment.end)
                        ? segment.end
                        : Number.isFinite(audio.duration)
                            ? audio.duration
                            : undefined;

                    if (effectiveEnd !== undefined && currentTime >= effectiveEnd) {
                        audio.currentTime = segment.start;
                        // Optionally reset selected ayah to the first ayah of the range
                        const firstUUID = segment.firstUUID;
                        if (firstUUID) {
                            selectedAyahUUIDRef.current = firstUUID;
                            lastAyahFromTimeUpdate.current = firstUUID;
                            setSelected((prev) => ({
                                ...prev,
                                ayahUUID: firstUUID,
                            }));
                        }
                        if (playingRef.current) {
                            audio.play().catch(() => { });
                        }
                    }
                }
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [
        ayahsTimestamps,
        surahAyahs,
        setSelected,
        setPlayOptions,
        getAyahSegmentSeconds,
        getAyahsSegmentSeconds,
    ]);

    // Jump to ayah timestamp when selected ayah changes
    useEffect(() => {
        if (
            !audioRef.current ||
            !selected.ayahUUID ||
            ayahsTimestamps.length === 0 ||
            surahAyahs.length === 0 ||
            !recitationFileUrl
        ) {
            return;
        }

        if (lastAyahFromTimeUpdate.current === selected.ayahUUID) {
            return;
        }

        const ayahIndex = surahAyahs.findIndex(
            (ayah) => ayah.uuid === selected.ayahUUID
        );

        if (ayahIndex === -1) {
            return;
        }

        if (ayahIndex > 0 && ayahIndex - 1 >= ayahsTimestamps.length) {
            return;
        }

        const targetTimestamp =
            ayahIndex === 0
                ? 0
                : timestampToSeconds(ayahsTimestamps[ayahIndex - 1]);

        const audio = audioRef.current;

        if (audio.readyState >= 2) {
            const timeDifference = Math.abs(
                audio.currentTime - targetTimestamp
            );
            if (timeDifference > 0.5) {
                audio.currentTime = targetTimestamp;
            }
        }
    }, [selected.ayahUUID, ayahsTimestamps, surahAyahs, recitationFileUrl]);

    useEffect(() => {
        if (!audioRef.current) return;
        // Ensure playback rate is correctly re-applied whenever
        // speed settings change or a new surah/audio source loads.
        audioRef.current.playbackRate = playBackActive ? playBackRate : 1;
    }, [playBackRate, playBackActive, recitationFileUrl]);

    const handleEnded = () => {
        const audio = audioRef.current;
        const repeatMode = repeatModeRef.current;
        const repeatRange = repeatRangeRef.current;

        // Repeat single ayah: jump back to that ayah's start and keep playing.
        if (repeatMode === "ayah" && audio) {
            const segment = getAyahSegmentSeconds(selectedAyahUUIDRef.current);
            if (segment) {
                audio.currentTime = segment.start;
                audio.play().catch(() => { });
                setPlayOptions((prev) => ({ ...prev, playing: true }));
                return;
            }
        }

        // Repeat surah (range): restart the surah audio when it ends.
        if (repeatMode === "range" && repeatRange === "surah" && audio) {
            audio.currentTime = 0;
            lastAyahFromTimeUpdate.current = undefined;
            if (surahAyahs[0]?.uuid) {
                setSelected((prev) => ({ ...prev, ayahUUID: surahAyahs[0].uuid }));
            }
            audio.play().catch(() => { });
            setPlayOptions((prev) => ({ ...prev, playing: true }));
            return;
        }

        // Repeat page/juz/hizb segments (range): jump back to segment start.
        if (
            repeatMode === "range" &&
            (repeatRange === "page" ||
                repeatRange === "juz" ||
                repeatRange === "hizb") &&
            audio
        ) {
            const ayahUUIDs =
                repeatRange === "page"
                    ? pageAyahUUIDsRef.current
                    : repeatRange === "juz"
                        ? juzAyahUUIDsRef.current
                        : hizbAyahUUIDsRef.current;
            const segment = getAyahsSegmentSeconds(ayahUUIDs);
            if (segment) {
                audio.currentTime = segment.start;
                if (segment.firstUUID) {
                    selectedAyahUUIDRef.current = segment.firstUUID;
                    lastAyahFromTimeUpdate.current = segment.firstUUID;
                    setSelected((prev) => ({ ...prev, ayahUUID: segment.firstUUID }));
                }
                audio.play().catch(() => { });
                setPlayOptions((prev) => ({ ...prev, playing: true }));
                return;
            }
        }

        // Default: rotate through all surahs in order, looping back to the first.
        if (recitationSurahs.length > 0) {
            const nextIndex =
                currentSurahIndex < recitationSurahs.length - 1
                    ? currentSurahIndex + 1
                    : 0;

            setCurrentSurahIndex(nextIndex);

            if (audio) {
                audio.currentTime = 0;
            }

            setPlayOptions((prev) => ({ ...prev, playing: true }));
            return;
        }

        // If for some reason there are no recitation surahs, just stop.
        setPlayOptions((prev) => ({ ...prev, playing: false }));
    };

    return (
        <audio
            ref={audioRef}
            {...restProps}
            controls
            style={{ display: "none" }}
            src={recitationFileUrl}
            onEnded={handleEnded}
            preload="auto"
        />
    );
}
