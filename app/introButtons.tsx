"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSelected } from "../contexts/selectedsContext";
import { useRouter } from "next/navigation";
import { Material } from "@yakad/symbols";

export default function IntroButtons() {
    const [selected, setSelected] = useSelected();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleOpenBookmarkClick = () => {
        setLoading(true);
        router.push("/mushaf/hafs");
    }

    return (
        <Button onClick={handleOpenBookmarkClick} variant="outline" disabled={loading || selected.bookmarkedAyahUUID === "UUID"} >
            <Material icon="bookmark" />
            Open bookmark
            {loading && <Spinner />}
        </Button>
    );
}
