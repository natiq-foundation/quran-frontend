"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Material } from "@yakad/symbols";

export function ChangeThemeButton() {
    const { theme, setTheme } = useTheme();

    const changeThemeOnclick = () => {
        if (theme === "light") setTheme("dark");
        if (theme === "dark") setTheme("system");
        if (theme === "system") setTheme("light");
    }


    return (
        <Button variant="outline" size="icon-lg" className="w-full" onClick={changeThemeOnclick}>
            {theme === "light" ?
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                : theme === "dark" ?
                    <Moon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" /> : <Material icon="computer" />}
            <span className="sr-only">Toggle theme</span>
            {theme}
        </Button>
    );
}
