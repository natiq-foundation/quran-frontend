import { Button } from "@/components/ui/button";
import { MushafSettingsButton } from "./buttons/MushafSettingsButton";
import { getTranslations } from "@/app/actions/getTranslations";
import { Material } from "@yakad/symbols";

export async function Header() {
    "use cache";
    const translations = await getTranslations("hafs", 200, 0);
    return (
        <header className="z-50 sticky top-0 flex items-center justify-center px-4 py-4 border-b bg-background/65 backdrop-blur supports-backdrop-filter:bg-background/65">
            <div className="w-4xl max-w-full flex flex-row items-center justify-between">
                <Button variant="ghost" size="icon" aria-label="Go back">
                    <Material icon="arrow_back" />
                </Button>

                <h1 className="text-xl font-semibold">Natiq</h1>

                <MushafSettingsButton translations={translations} />
            </div>

        </header>
    );
}
