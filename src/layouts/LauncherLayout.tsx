import { Outlet } from "react-router-dom"
import { Material } from "@yakad/symbols"
import { useTranslation } from "react-i18next"
import ResponsiveMenu, { NavItem } from "@/components/modules/nav/ResponsiveNav"

export default function Layout() {
    const { t } = useTranslation()

    return (
        <div className="relative min-h-screen pb-20 md:pb-0">
            <ResponsiveMenu open>
                <NavItem
                    icon={<Material icon="search" size={24} />}
                    label={t("common.search")}
                    to="/search"
                />
                <NavItem
                    icon={<Material icon="settings" size={24} />}
                    label={t("common.settings")}
                    to="/settings"
                />
            </ResponsiveMenu>

            <main className="md:ml-24 p-4">
                <Outlet />
            </main>
        </div>
    )
}