import { Symbol } from "@yakad/symbols";

interface SurahHeaderProps {
    surah?: {
        uuid?: string;
        names?: { name?: string }[];
        number_of_ayahs?: number | string;
        bismillah?: {
            text?: string;
            is_ayah?: boolean;
        };
        number: number;
    };
    makkiMadani: "makki" | "maddani";
}

export default function SurahHeader({ surah, makkiMadani }: SurahHeaderProps) {
    if (!surah) return null;

    return (
        <div className="pt-3 pb-3 pr-5 pl-5 mb-4 text-center bg-primary/20 rounded-2xl flex flex-row justify-between items-center border border-primary/30">
            <h3>{surah.number}</h3>
            <div>
                <h2 className="text-2xl">
                    {(surah?.names || [{ name: "NOTFOUND" }])[0]?.name ||
                        "Name Not found!"}
                </h2>
                <p>{surah?.number_of_ayahs} Ayahs</p>
            </div>
            {makkiMadani === "makki" ? <Symbol icon="MakkahOutlined" filled /> : <Symbol icon="MadinehOutlined" filled />}
        </div>
    );
}
