import { useState } from "react"
import { Material } from "@yakad/symbols"
import { useSettings } from "@/context/settingsContext"
import { resetPWA } from "@/lib/resetPWA"
import { toggleTheme } from "@/lib/theme"
import { useTranslation } from "react-i18next"
import type { LangCodeType } from "@yakad/lib"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function SettingsDropdown() {
    const { t } = useTranslation()
    const [showLangMenu, setShowLangMenu] = useState(false)
    const [settings, setSettings] = useSettings()
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark =
        settings.themeMode === "dark" ||
        (settings.themeMode === "system" && systemDark)

    const changeLanguage = (code: LangCodeType) => {
        setSettings({
            ...settings,
            language: code,
        })
        setShowLangMenu(false)
    }

    const handleTheme = () => {
        toggleTheme(settings, setSettings)
    }

    const themeIcon = isDark ? "light_mode" : "dark_mode"
    const label = isDark ? t("common.lightMode") : t("common.darkMode")

    const languages: { code: LangCodeType; label: string }[] = [
        { code: "en", label: "English" },
        { code: "ar", label: "العربية" },
        { code: "fa", label: "فارسی" },
        { code: "az", label: "Azərbaycan" },
    ]

    return (
        <div className="flex flex-col gap-1">
            {!showLangMenu && (
                <>
                    <Button
                        variant="ghost"
                        onClick={resetPWA}
                        className="w-full justify-start gap-3 rounded-full text-red-500 hover:text-red-500"
                    >
                        <Material icon="restart_alt" size={24} />
                        {t("common.resetApp")}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => setShowLangMenu(true)}
                        className="w-full justify-start gap-3 rounded-full"
                    >
                        <Material icon="language" size={24} />
                        {t("common.language")}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={handleTheme}
                        className="w-full justify-start gap-3 rounded-full"
                    >
                        <Material icon={themeIcon} size={24} />
                        {label}
                    </Button>
                </>
            )}

            {showLangMenu && (
                <>
                    <Button
                        variant="ghost"
                        onClick={() => setShowLangMenu(false)}
                        className="justify-start gap-2 rounded-full"
                    >
                        <Material icon="arrow_back" size={24} />
                        {t("common.back")}
                    </Button>

                    <Separator className="my-1" />

                    {languages.map(({ code, label }) => (
                        <Button
                            key={code}
                            variant="ghost"
                            onClick={() => changeLanguage(code)}
                            className={`justify-start rounded-full ${settings.language === code ? "text-primary font-semibold" : ""
                                }`}
                        >
                            {label}
                        </Button>
                    ))}
                </>
            )}
        </div>
    )
}