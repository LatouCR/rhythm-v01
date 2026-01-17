"use client"
import { BeatmapResponse } from "@/lib/types/BeatmapResponse";
import { useState } from "react"
import Image from "next/image";
import { cn } from "@/lib";


export default function BeatmapPreview({
    beatmaps
}: BeatmapResponse) {

    const [isHovered, setIsHovered] = useState(false);

    console.log(isHovered);

    return (
        <div className="w-screen h-screen flex items-end flex-col gap-2 bg-white py-4 font-playpen-sans">
            <div className={cn("lg:max-w-[calc(100vw-60%)] max-w-[calc(100vw-40%)] min-h-35 w-full flex items-center justify-end rounded-l-2xl bg-green-600 hover:cursor-pointer",
                "hover:max-w-[calc(100vw-58%)] transition-all duration-300"
            )}>
                <div className="w-14 shrink-0 min-h-34 flex flex-col justify-between items-center">
                    <span className="text-6xl font-bold text-green-700 items-center flex-1 flex py-2 h-full">
                        A
                    </span>
                    <span className="w-full flex justify-center border-t py-2 h-2/12 border-white">
                        <div className="flex items-center gap-1.5">
                            <span className="py-0.5 text-xs font-medium text-white">
                                <span className="text-yellow-400">★</span>
                                <span className="text-xs font-bold text-white">10.5</span>
                            </span>
                        </div>
                    </span>
                </div>
                <div className={cn("relative max-w-[94%] w-full min-h-34 overflow-hidden rounded-l-2xl bg-zinc-900 flex flex-col justify-between",
                    "transition-all duration-300"
                )}>
                    <div className="absolute inset-0 flex justify-end">
                        <div className="relative h-full w-full mask-l-from-0% mask-l-to-100%" onPointerEnter={() => setIsHovered((prev) => !prev)
                        }>
                            <Image src={beatmaps[1].backgroundUrl || ""} fill alt="Beatmap Background" className="object-cover object-center" />
                        </div>
                        <span className={cn("absolute h-full w-[70%] z-1 bg-green-600/20 mask-l-from-90% mask-l-to-100% opacity-20 right-0 top-0",
                            isHovered ? "animate-bpm-pulse" : ""
                        )} />
                    </div>
                    <div className="flex flex-1 flex-col justify-end gap-0.5 px-4 py-3 h-10/12 z-100">
                        <h2 className="text-2xl font-bold text-white">{beatmaps[1].title}</h2>
                        <p className="text-sm text-zinc-400">{beatmaps[1].artist}</p>
                    </div>
                    <div className="relative flex items-center gap-3 border-t border-white px-4 py-2 h-2/12 z-100">
                        <div className="flex items-center gap-1.5">
                            <span className="rounded bg-purple-600/80 px-1.5 py-0.5 text-xs font-medium text-white">[4K]</span>
                            <span className="text-sm font-medium text-purple-400">{beatmaps[1].versions[0].version}</span>
                        </div>
                        <span className="text-sm text-zinc-400">
                            mapped by <span className="text-white">{beatmaps[1].creator}</span>
                        </span>
                    </div>
                </div>

            </div>
        </div>
    )
}