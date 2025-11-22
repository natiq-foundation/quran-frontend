"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Symbol } from "@yakad/symbols";
import { SelectRecitation } from "@/components/inputs/SelectRecitation";
import { useSelected } from "@/contexts/selectedsContext";
import { RecitationList } from "@ntq/sdk";

type PlayerSettingsButtonProps = {
    recitations: RecitationList[];
    loading?: boolean;
};

export function PlayerSettingsButton({
    recitations,
}: PlayerSettingsButtonProps) {
    const [autoScroll, setAutoScroll] = useState(false);
    const [selected, setSelected] = useSelected();

    const onRecitationChanged = (val: string) =>
        setSelected((prev) => ({ ...prev, recitationUUID: val }));

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon-lg">
                    <Symbol icon="tune" />
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px] flex pl-52 pr-52">
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-6">
                    <SelectRecitation
                        recitations={recitations}
                        selectedReciter={selected.recitationUUID}
                        onValueChange={onRecitationChanged}
                    />

                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Auto scroll</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="autoScroll"
                                checked={autoScroll}
                                onCheckedChange={(checked) =>
                                    setAutoScroll(checked as boolean)
                                }
                            />
                            <Label
                                htmlFor="autoScroll"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Auto scroll
                            </Label>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
