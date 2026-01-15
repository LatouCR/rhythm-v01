import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { beatmapSets } from "@/lib/db/schema";
import { toMusicPlayerBeatmapFromDb } from "@/lib/types/BeatmapResponse";

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

    const tracks = allBeatmapSets.map(toMusicPlayerBeatmapFromDb);

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error fetching beatmap sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch beatmap sets" },
      { status: 500 }
    );
  }
}
