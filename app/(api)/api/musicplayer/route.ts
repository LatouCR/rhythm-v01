import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { beatmapSets } from "@/lib/db/schema";

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

    const tracks = allBeatmapSets.map((set, index) => ({
      id: set.id,
      order: index,
      audioUrl: set.general.AudioFile,
      backgroundUrl: set.general.BackgroundFile,
      previewTime: set.general.PreviewTime,
      title: set.metadata.Title,
      artist: set.metadata.Artist,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error fetching beatmap sets:", error);
    return NextResponse.json(
      { error: "Failed to fetch beatmap sets" },
      { status: 500 }
    );
  }
}
