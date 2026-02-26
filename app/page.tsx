import { Button } from "@/components/ui/button";
import Link from "next/link";
import GotoBookmark from "./introButtons";
import { Material } from "@yakad/symbols";

export default function Home() {
    return (
        <div className="flex items-center justify-center p-10 gap-4">
            <Button variant="secondary" asChild>
                <Link href="/mushaf/hafs">

                    <Material icon="auto_stories" />
                    Go to Mushaf page! (hafs)
                </Link>
            </Button>
            <GotoBookmark />
        </div>
    );
}
