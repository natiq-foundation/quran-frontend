"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Symbol } from "@yakad/symbols";
import { SelectRecitation } from "@/components/inputs/SelectRecitation";
import { useSelected } from "@/contexts/selectedsContext";
import { RecitationList } from "@ntq/sdk";
import { useEffect, useEffectEvent, useState } from "react";
import { useWindowSize } from "../useWindowSize";
import { UserList } from "@/components/user-list";

type PlayerSettingsButtonProps = {
    recitations: RecitationList[];
    loading?: boolean;
};

export function PlayerSettingsButton({
    recitations,
}: PlayerSettingsButtonProps) {
    const [selected, setSelected] = useSelected();
    const [mounted, setMounted] = useState(false);
    const [windowWidth] = useWindowSize();

    const setMountedEffect = useEffectEvent(() => setMounted(true));

    // Ensure we're on the client side before checking localStorage
    useEffect(() => {
        setMountedEffect();
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (recitations.length === 0) return;

        const stored =
            typeof window !== "undefined"
                ? localStorage.getItem("selected")
                : null;

        let hasStoredRecitation = false;
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                hasStoredRecitation =
                    parsed?.recitationUUID &&
                    parsed.recitationUUID !== "UUID" &&
                    parsed.recitationUUID !== "";
            } catch (e) {
                // If parsing fails, treat as no stored value
            }
        }
        if (
            !hasStoredRecitation &&
            (!selected.recitationUUID || selected.recitationUUID === "UUID")
        ) {
            setSelected((prev) => ({
                ...prev,
                recitationUUID: recitations[0].uuid,
            }));
        }
    }, [selected.recitationUUID, recitations, setSelected, mounted]);

    const onRecitationChanged = (val: string) =>
        setSelected((prev) => ({ ...prev, recitationUUID: val }));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg">
                    <Symbol icon="account_circle" />
                </Button>
            </SheetTrigger>
            <SheetContent
                className="flex"
                side={windowWidth <= 800 ? "bottom" : "right"}
            >
                <SheetHeader>
                    <SheetTitle>Recitations Settings</SheetTitle>
                </SheetHeader>

                <UserList users={recitations.map((recitation) => ({ id: recitation.uuid, avatar: "", description: recitation.recitation_date, name: recitation.reciter?.name || "Name" }))} onSelect={(uuid) => setSelected(prev => ({ ...prev, recitationUUID: uuid as string }))} />
            </SheetContent>
        </Sheet>
    );
}
