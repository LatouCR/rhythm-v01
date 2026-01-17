import { cn } from "@/lib";
import { fetchBeatmaps } from "../menu/page"
import BeatmapPreview from "../menu/components/BeatmapPreview";
import Image from "next/image";

export default async function TestPage() {

    const beatmapsPromise = await fetchBeatmaps();
    const beatmaps = beatmapsPromise.beatmaps;

    return (
        <BeatmapPreview beatmaps={beatmaps} />
    )
}
