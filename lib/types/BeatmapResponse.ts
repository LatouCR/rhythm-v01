import { MusicPlayerTrack } from './TrackResponse';
import type { Difficulty, Events, TimingPoint, HitObject } from './Metadata';

// Individual beatmap version (difficulty) within a set
export interface BeatmapVersion {
    id: string;
    version: string;
    difficulty: Difficulty;
    events: Events;
    timingPoints: TimingPoint[];
    hitObjects: HitObject[];
}

// Complete beatmap set with all versions
export interface PlayableBeatmap {
    id: string;
    order: number;
    audioUrl: string;
    backgroundUrl: string;
    previewTime: number;
    title: string;
    artist: string;
    creator: string;
    tags: string[];
    beatmapSetId: number;
    versions: BeatmapVersion[];
}

// API response structure
export interface BeatmapResponse {
    beatmaps: PlayableBeatmap[];
}


// Subset for Menu/MapSelection component
export interface MenuBeatmap {
    id: string;
    order: number;
    title: string;
    artist: string;
    creator: string;
    backgroundUrl: string;
    previewTime: number;
    versions: MenuBeatmapVersion[];
}

// Simplified version info for menu display
export interface MenuBeatmapVersion {
    id: string;
    version: string;
    keys: number;
}

// Subset for Gameplay component
export interface GameplayBeatmap {
    id: string;
    audioUrl: string;
    backgroundUrl: string;
    title: string;
    artist: string;
    version: BeatmapVersion;
}

// Utility to extract MusicPlayer-specific data
export function toMusicPlayerBeatmap(beatmap: PlayableBeatmap): MusicPlayerTrack {
    return {
        id: beatmap.id,
        title: beatmap.title,
        artist: beatmap.artist,
        audioUrl: beatmap.audioUrl,
        backgroundUrl: beatmap.backgroundUrl,
    };
}

// Utility to extract Menu-specific data
export function toMenuBeatmap(beatmap: PlayableBeatmap): MenuBeatmap {
    return {
        id: beatmap.id,
        order: beatmap.order,
        title: beatmap.title,
        artist: beatmap.artist,
        creator: beatmap.creator,
        backgroundUrl: beatmap.backgroundUrl,
        previewTime: beatmap.previewTime,
        versions: beatmap.versions.map(v => ({
            id: v.id,
            version: v.version,
            keys: v.difficulty.Keys,
        })),
    };
}

// Utility to extract Gameplay-specific data for a selected version
export function toGameplayBeatmap(beatmap: PlayableBeatmap, versionId: string): GameplayBeatmap | null {
    const version = beatmap.versions.find(v => v.id === versionId);
    if (!version) return null;

    return {
        id: beatmap.id,
        audioUrl: beatmap.audioUrl,
        backgroundUrl: beatmap.backgroundUrl,
        title: beatmap.title,
        artist: beatmap.artist,
        version,
    };
}

// === DB Layer Mappers ===

// Raw DB beatmap row shape
export interface DbBeatmapRow {
    id: string;
    beatmapSetId: number;
    version: string;
    difficulty: Difficulty;
    events: Events;
    timingPoints: TimingPoint[];
    hitObjects: HitObject[];
}

// Raw DB beatmap set row shape
export interface DbBeatmapSetRow {
    id: string;
    beatmapSetId: number;
    general: {
        AudioFile: string;
        BackgroundFile: string;
        PreviewTime: number;
    };
    metadata: {
        Title: string;
        Artist: string;
        Creator: string;
        Tags: string[];
    };
}

// Map DB beatmap row to BeatmapVersion
export function toBeatmapVersion(row: DbBeatmapRow): BeatmapVersion {
    return {
        id: row.id,
        version: row.version,
        difficulty: row.difficulty,
        events: row.events,
        timingPoints: row.timingPoints,
        hitObjects: row.hitObjects,
    };
}


// Map DB beatmap set row to PlayableBeatmap
export function toPlayableBeatmap(
    row: DbBeatmapSetRow,
    order: number,
    versions: BeatmapVersion[]
): PlayableBeatmap {
    return {
        id: row.id,
        order,
        audioUrl: row.general.AudioFile,
        backgroundUrl: row.general.BackgroundFile,
        previewTime: row.general.PreviewTime,
        title: row.metadata.Title,
        artist: row.metadata.Artist,
        creator: row.metadata.Creator,
        tags: row.metadata.Tags,
        beatmapSetId: row.beatmapSetId,
        versions,
    };
}

// Map DB beatmap set row directly to MusicPlayerBeatmap
export function toMusicPlayerBeatmapFromDb(row: DbBeatmapSetRow): MusicPlayerTrack {
    return {
        id: row.id,
        title: row.metadata.Title,
        artist: row.metadata.Artist,
        audioUrl: row.general.AudioFile,
        backgroundUrl: row.general.BackgroundFile,
    };
}
