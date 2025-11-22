import { Header } from "@/components/header";
import { Player } from "@/components/player";
import Main from "./main";
import { Suspense } from "react";

export default async function QuranPage() {
    return (
        <>
            <Suspense fallback={<h1>Loading Header</h1>}>
                <Header />
            </Suspense>
            <Main />
            <Suspense fallback={<h1>Loading Player</h1>}>
                <Player />
            </Suspense>
        </>
    );
}
