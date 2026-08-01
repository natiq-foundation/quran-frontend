import { Card, CardContent } from "@/components/ui/card"
import { SettingsDropdown } from "@/components/modules/settings/SettingsDropdown"

export default function Settings() {
    return (
        <Card className="max-w-sm mx-auto mt-4">
            <CardContent className="p-2">
                <SettingsDropdown />
            </CardContent>
        </Card>
    )
}