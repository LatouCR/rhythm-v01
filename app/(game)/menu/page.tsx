import { fetchBeatmaps } from "@/lib/queries/beatmaps";
import Datadisplay from "./components/Datadisplay";

export default async function Menu() {
    const beatmapsPromise = fetchBeatmaps();

    return (
        <main className="w-full h-screen justify-center items-start flex flex-col overflow-y-auto">
            <Datadisplay beatmapsPromise={beatmapsPromise} />
        </main>
    );
}