"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RecitationList } from "@ntq/sdk";

type SelectRecitationProps = {
    recitations: RecitationList[];
    selectedReciter: string;
    onValueChange: (value: string) => void;
};

export function SelectRecitation({
    recitations,
    selectedReciter,
    onValueChange,
}: SelectRecitationProps) {
    const isEmpty = recitations.length <= 0;

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recite</h3>
            {isEmpty ? (
                <p className="text-sm text-muted-foreground">
                    No recitation Found!
                </p>
            ) : (
                <Select value={selectedReciter} onValueChange={onValueChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Reciter - Reciting type" />
                    </SelectTrigger>
                    <SelectContent>
                        {recitations.map((recitation, index) => (
                            <SelectItem key={index} value={recitation.uuid}>
                                {recitation.uuid}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
