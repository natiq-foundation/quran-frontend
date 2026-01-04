import { Button } from "@/components/ui/button";
import Link from "next/link";
import GotoBookmark from "./introButtons";
import { Symbol } from "@yakad/symbols";

export default function Home() {
    return (
        <div className="flex items-center justify-center p-10 gap-4">
            <Button variant="secondary" asChild>
                <div>
                    <Symbol icon="auto_stories" />
                    <Link href="/mushaf/hafs">Go to Mushaf page! (hafs)</Link>
                </div>
            </Button>
            <GotoBookmark />
        </div>
    );
}
