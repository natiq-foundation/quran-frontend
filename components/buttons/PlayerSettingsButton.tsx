"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Avatar,
    AvatarImage,
    AvatarFallback
} from "@/components/ui/avatar";
import { Material } from "@yakad/symbols";
import { useSelected } from "@/contexts/selectedsContext";
import { RecitationList } from "@ntq/sdk";
import { useEffect, useEffectEvent, useState, useMemo } from "react";
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
    const [sheetOpen, setSheetOpen] = useState(false);

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

    const currentRecitation = useMemo(() => {
        return recitations.filter((val, index) => val.uuid === selected.recitationUUID)[0];
    }, [selected.recitationUUID, recitations]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg">
                    <Avatar>
                        <AvatarImage alt={currentRecitation?.reciter?.name} src={""} />
                        <AvatarFallback>
                            <Material icon="person" />
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="flex"
                side={windowWidth <= 800 ? "bottom" : "right"}
            >
                <SheetHeader>
                    <SheetTitle>Recitations Settings</SheetTitle>
                </SheetHeader>

                <div>
                    <UserList
                        users={recitations.map((recitation) => ({
                            id: recitation.uuid,
                            avatar: "",
                            description: recitation.recitation_date,
                            name: recitation.reciter?.name || "Name",
                        }))}
                        selectedId={selected.recitationUUID}
                        onSelect={(uuid) => {
                            setSelected((prev) => ({
                                ...prev,
                                recitationUUID: uuid as string,
                            }));
                            setSheetOpen(false);
                        }}
                    />
                </div>
            </SheetContent>
        </Sheet>
    );
}
