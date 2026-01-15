import type { BeatmapResponse } from "@/lib/types/BeatmapResponse";
import Datadisplay from "./components/Datadisplay";

export default async function Menu() {
    const beatmapsPromise = fetchBeatmaps();

    return (
        <main className="w-full h-screen justify-center items-start flex flex-col overflow-y-auto">
            <Datadisplay beatmapsPromise={beatmapsPromise} />
        </main>
    );
}

async function fetchBeatmaps(): Promise<BeatmapResponse> {
    const response = await fetch("http://localhost:3000/api/beatmaps/sets", { cache: "force-cache" });
    if (!response.ok) {
        throw new Error("Failed to fetch beatmaps");
    }
    return response.json();
}