"use client"
import { PlayableBeatmap, BeatmapResponse } from "@/lib/types/BeatmapResponse";
import { useState } from "react"
import Image from "next/image";
import { cn } from "@/lib";
import { motion } from "motion/react";
import AudioVisualizer from "@/components/GameUI/Audio/AudioVisualizer";
import { useMusicPlayer } from "@/lib/hooks/useMusicPlayer";
import { getDifficultyTier } from "@/lib/utils/uihelper";

interface BeatmapCardProps {
    beatmap: PlayableBeatmap;
    rank: string;
}

function BeatmapCard({ beatmap, rank }: BeatmapCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        console.log(`started: ${beatmap.title} map`);
    };

    const level = beatmap.versions[0]?.difficulty.OverallDifficulty ?? 0;
    const { color } = getDifficultyTier(level)

    const bgColor = color;

    return (
        <motion.div
            className="lg:h-35 max-w-[calc(100vw-40%)] min-h-35 w-full flex items-center justify-end rounded-l-2xl cursor-pointer"
            style={{ backgroundColor: bgColor }}
            initial={{ width: 1050, opacity: 0 }}
            animate={{ width: 1050, opacity: 1 }}
            whileHover={{ width: 1100 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div className="w-14 shrink-0 max-h-34.5 h-full flex flex-col justify-between items-center">
                <span className="text-6xl font-bold text-white items-center flex-1 flex py-2 h-full">
                    {rank}
                </span>
                <span className="flex items-center border-t border-white px-4 py-2 max-h-10">
                    {beatmap.versions[0]?.difficulty.OverallDifficulty && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-md font-medium text-white">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm font-bold text-white">
                                    {beatmap.versions[0]?.difficulty.OverallDifficulty.toFixed(1)}
                                </span>
                            </span>
                        </div>
                    )}
                </span>
            </div>
            <div className="relative max-w-[94%] w-full max-h-34.5 lg:h-full overflow-hidden rounded-l-2xl bg-zinc-900 flex flex-col justify-between">
                <div className="absolute inset-0 flex justify-end">
                    <div className="relative h-full w-full mask-l-from-0% mask-l-to-100%">
                        <Image
                            src={beatmap.backgroundUrl || ""}
                            fill
                            alt="Beatmap Background"
                            className="object-cover object-center"
                        />
                    </div>
                    <span
                        className={cn(
                            "absolute h-full w-[70%] z-1 mask-l-from-90% mask-l-to-100% right-0 top-0",
                            isHovered && "animate-bpm-pulse"
                        )}
                        style={{ backgroundColor: bgColor, opacity: 0.05 }}
                    />
                </div>
                <div className="flex flex-1 flex-col justify-end gap-0.5 px-4 py-3 h-10/12 z-100">
                    <h2 className="text-2xl font-bold text-white">{beatmap.title}</h2>
                    <p className="text-sm text-zinc-400">{beatmap.artist}</p>
                </div>
                <div className="relative flex items-center gap-3 border-t border-white px-4 py-2 z-100 min-h-10">
                    <div className="flex items-center gap-1.5">
                        <span className="rounded bg-purple-600/80 px-1.5 py-0.5 text-xs font-medium text-white">[4K]</span>
                        <span className="text-sm font-medium text-purple-400">{beatmap.versions[0]?.version}</span>
                    </div>
                    <span className="text-sm text-zinc-400">
                        mapped by <span className="text-white">{beatmap.creator}</span>
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default function BeatmapPreview({ beatmaps }: BeatmapResponse) {
    const { analyser } = useMusicPlayer();

    const [firstBeatmap] = beatmaps;

    if (!firstBeatmap) return null;


    return (
        <div className="w-screen h-screen flex items-end flex-col gap-2 bg-white">
            {beatmaps.map((beatmap, index) => (
                <BeatmapCard
                    key={beatmap.id}
                    beatmap={beatmap}
                    rank={String.fromCharCode(65 + index)}
                />
            ))}
            <div className="absolute bottom-0 w-full max-h-37.5 flex flex-col justify-center items-start pointer-events-none">
                <div className="w-2/3">
                    <AudioVisualizer analyser={analyser} />
                </div>
                <div className="border-t-2 border-red-500 min-h-20 w-full justify-between items-center flex px-4 py-2 pointer-events-auto bg-black">

                </div>
            </div>
        </div>
    );
}