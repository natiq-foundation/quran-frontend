"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSelected } from "../contexts/selectedsContext";
import { useRouter } from "next/navigation";
import { Symbol } from "@yakad/symbols";

export default function IntroButtons() {
    const [selected, setSelected] = useSelected();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleOpenBookmarkClick = () => {
        setSelected(prev => ({ ...prev, ayahUUID: prev.bookmarkedAyahUUID }));

        setLoading(true);
        router.push("/mushaf/hafs");
    }

    return (
        <Button onClick={handleOpenBookmarkClick} variant="outline" disabled={loading}>
            <Symbol icon="bookmark" />
            Open bookmark
            {loading && <Spinner />}
        </Button>
    );
}
