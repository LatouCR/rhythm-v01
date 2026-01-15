"use client";
import type { BeatmapResponse, PlayableBeatmap } from "@/lib/types/BeatmapResponse";
import { useAudioStore } from "@/lib";
import { use, useRef, useCallback, forwardRef, useState } from "react";
import { bmToMusicPlayer } from "@/lib/types/TrackResponse";
import { useRouter } from "next/navigation";

interface DatadisplayProps {
    beatmapsPromise: Promise<BeatmapResponse>;
}

export default function Datadisplay({ beatmapsPromise }: DatadisplayProps) {
    const { beatmaps } = use(beatmapsPromise);
    const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const { playTrack } = useAudioStore();

    const playBeatmap = useCallback((beatmapSet: PlayableBeatmap) => {
        const track = bmToMusicPlayer(beatmapSet);
        playTrack(track);
    }, [playTrack]);

    const router = useRouter();

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
        let newIndex = selectedIndex;

        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                newIndex = selectedIndex <= 0 ? 0 : selectedIndex - 1;
                break;
            case "ArrowDown":
                event.preventDefault();
                newIndex = selectedIndex >= beatmaps.length - 1 ? beatmaps.length - 1 : selectedIndex + 1;
                break;
            case "Enter":
                if (selectedIndex >= 0 && selectedIndex < beatmaps.length) {
                    console.log("Map Selected - Should transition to gameplay");
                }
                return;
            default:
                return;
        }

        if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < beatmaps.length) {
            setSelectedIndex(newIndex);
            itemRefs.current[newIndex]?.focus();
            playBeatmap(beatmaps[newIndex]);
        }
    }, [beatmaps, playBeatmap, selectedIndex]);

    const handleItemFocus = useCallback((index: number, beatmapSet: PlayableBeatmap) => {
        if (index === selectedIndex) return;
        setSelectedIndex(index);
        playBeatmap(beatmapSet);
    }, [playBeatmap, selectedIndex]);

    const currentBackground = selectedIndex >= 0 ? beatmaps[selectedIndex]?.backgroundUrl : beatmaps[0]?.backgroundUrl;

    return (
        <div className="relative w-full h-full min-h-screen">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: currentBackground ? `url(${currentBackground})` : undefined }}
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl p-4 mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Available Beatmaps</h2>
                <ul className="space-y-4" onKeyDown={handleKeyDown}>
                    {beatmaps.map((set, index) => (
                        <BeatmapSetCard
                            key={set.id}
                            beatmapSet={set}
                            ref={(el: HTMLLIElement | null) => { itemRefs.current[index] = el; }}
                            onItemFocus={() => handleItemFocus(index, set)}
                        />
                    ))}
                </ul>
                <button onClick={() => router.push("/")}>Go home</button>

            </div>
        </div>
    );
}

interface BeatmapSetCardProps {
    beatmapSet: PlayableBeatmap;
    onItemFocus: () => void;
}

const BeatmapSetCard = forwardRef<HTMLLIElement, BeatmapSetCardProps>(
    function BeatmapSetCard({ beatmapSet, onItemFocus }, ref) {
        return (
            <li
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                ref={ref}
                tabIndex={0}
                onFocus={onItemFocus}
            >
                <div className="flex items-start gap-4">
                    <div
                        className="w-24 h-24 bg-gray-600 rounded-md bg-cover bg-center shrink-0 pointer-events-none"
                        style={{ backgroundImage: `url(${beatmapSet.backgroundUrl})` }}
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">
                            {beatmapSet.title}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                            {beatmapSet.artist}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                            Mapped by {beatmapSet.creator}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {beatmapSet.versions.map((version) => (
                                <DifficultyBadge
                                    key={version.id}
                                    version={version.version}
                                    keys={version.difficulty.Keys}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </li>
        );
    }
);

interface DifficultyBadgeProps {
    version: string;
    keys: number;
}

function DifficultyBadge({ version, keys }: DifficultyBadgeProps) {
    return (
        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-full text-xs text-white transition-colors">
            {version} ({keys}K)
        </button>
    );
}
