import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { beatmaps, beatmapSets } from "@/lib/db/schema";
import type { BeatmapResponse, BeatmapVersion } from "@/lib/types/BeatmapResponse";
import { toBeatmapVersion, toPlayableBeatmap } from "@/lib/types/BeatmapResponse";

export async function GET() {
  try {
    const allBeatmapSets = await db
      .select({
        id: beatmapSets.id,
        beatmapSetId: beatmapSets.beatmapSetID,
        general: beatmapSets.general,
        metadata: beatmapSets.metadata,
      })
      .from(beatmapSets)
      .orderBy(beatmapSets.createdAt);

    const allBeatmaps = await db
      .select({
        id: beatmaps.id,
        beatmapSetId: beatmaps.beatmapSetID,
        version: beatmaps.version,
        difficulty: beatmaps.difficulty,
        events: beatmaps.events,
        timingPoints: beatmaps.timingPoints,
        hitObjects: beatmaps.hitObjects,
      })
      .from(beatmaps);

    // Group beatmaps by their set ID
    const beatmapsBySetId = allBeatmaps.reduce((acc, bm) => {
      if (!acc[bm.beatmapSetId]) {
        acc[bm.beatmapSetId] = [];
      }
      acc[bm.beatmapSetId].push(toBeatmapVersion(bm));
      return acc;
    }, {} as Record<number, BeatmapVersion[]>);

    const playableBeatmaps = allBeatmapSets.map((set, index) =>
      toPlayableBeatmap(set, index, beatmapsBySetId[set.beatmapSetId] || [])
    );

    const response: BeatmapResponse = { beatmaps: playableBeatmaps };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching beatmap sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch beatmap sets" },
      { status: 500 }
    );
  }
}
