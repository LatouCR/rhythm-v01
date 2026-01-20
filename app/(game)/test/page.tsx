import { fetchBeatmaps } from "../menu/page"
import BeatmapPreview from "../menu/components/BeatmapPreview";

export default async function TestPage() {

    const beatmapsPromise = await fetchBeatmaps();
    const beatmaps = beatmapsPromise.beatmaps;

    return (
        <div className="w-screen h-screen">
            <BeatmapPreview beatmaps={beatmaps} />
        </div>
    )
}
