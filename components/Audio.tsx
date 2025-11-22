"use client";

import { getRecitation } from "@/app/actions/getRecitation";
import { getSurah } from "@/app/actions/getSurahs";
import { usePlayOptions } from "@/contexts/playOptionsContext";
import { useSelected } from "@/contexts/selectedsContext";
import { SurahDetail } from "@ntq/sdk";
import { useEffect, useRef, useState } from "react";

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [wordsTimestamps, setWordsTimestamps] = useState<any>([]);
    const [ayahsTimestamps, setAyahsTimestamps] = useState<string[]>([]);
    const [currentSurah, setCurrentSurah] = useState<SurahDetail>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [surahAyahs, setSurahAyahs] = useState<any[]>([]);
    // Track the last ayah UUID set by the timeupdate handler to avoid loops
    const lastAyahFromTimeUpdate = useRef<string | undefined>(undefined);

    const timestampToSeconds = (timestamp: string): number => {
        const [hours, minutes, seconds] = timestamp.split(":").map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

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
                            start: string;
                            end: string;
                            word_uuid: string;
                        }[];
                        ayahs_timestamps: string[];
                    };

                    setRecitationFileUrl(
                        recitationData.recitation_surahs[0].file_url
                    );
                    setWordsTimestamps(recitationData.words_timestamps);
                    setAyahsTimestamps(recitationData.ayahs_timestamps || []);
                    // Reset the ref when recitation changes
                    lastAyahFromTimeUpdate.current = undefined;

                    const surahUuid =
                        recitationData.recitation_surahs[0].surah_uuid;
                    if (surahUuid) {
                        const surah = await getSurah(surahUuid);
                        setCurrentSurah(surah);

                        if (surah.ayahs && Array.isArray(surah.ayahs)) {
                            setSurahAyahs(surah.ayahs);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error loading recitation:", error);
                    setPlayOptions((prev) => ({ ...prev, loading: false }));
                });
        } else {
            // Reset loading state if no recitation is selected
            setPlayOptions((prev) => ({ ...prev, loading: false }));
        }
    }, [selected.recitationUUID, setPlayOptions]);

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

        // Don't play if still loading
        if (playOptions.loading) {
            audioRef.current.pause();
            setPlayOptions((prev) => ({ ...prev, playing: false }));
            return;
        }

        if (isPlaying) {
            console.log(wordsTimestamps);
            if (wordsTimestamps.length >= 1) {
                setSelected((prev) => ({
                    ...prev,
                    wordUUID: wordsTimestamps[0].uuid,
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
                lastAyahFromTimeUpdate.current = newAyahUUID;
                setSelected((prev) => ({
                    ...prev,
                    ayahUUID: newAyahUUID,
                }));
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
        };
    }, [ayahsTimestamps, surahAyahs, setSelected]);

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
        audioRef.current.playbackRate = playBackActive ? playBackRate : 1;
    }, [playBackRate, playBackActive]);

    const handleEnded = () => {
        setPlayOptions((prev) => ({
            ...prev,
            playing: false,
        }));
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
