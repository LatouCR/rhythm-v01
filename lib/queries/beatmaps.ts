"use server";
import { BeatmapResponse } from "../types/BeatmapResponse";

export async function fetchBeatmaps(): Promise<BeatmapResponse> {
    const response = await fetch("http://localhost:3000/api/beatmaps/sets", { cache: "force-cache", next: { revalidate: 5000} });
    if (!response.ok) {
        throw new Error("Failed to fetch beatmaps");
    }
    return response.json();
}
