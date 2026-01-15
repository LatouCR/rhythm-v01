import { PlayableBeatmap } from './BeatmapResponse';
import type { General, Metadata } from './Metadata';

// Core track data fetched from API
export interface Track {
    id: string;
    order: number;
    // General data
    audioUrl: string;
    backgroundUrl: string;
    previewTime: number;
    // Metadata
    title: string;
    artist: string;
    creator: string;
    version: string;
    tags: string[];
    beatmapSetId: number;
}

// API response structure
export interface TrackResponse {
    tracks: Track[];
}

// Subset for MusicPlayer component
export interface MusicPlayerTrack {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    backgroundUrl: string;
    previewTime?: number;
}

// Subset for Menu/MapSelection component
export interface MenuTrack {
    id: string;
    order: number;
    title: string;
    artist: string;
    creator: string;
    version: string;
    backgroundUrl: string;
    previewTime: number;
}

// Utility to extract MusicPlayer-specific data
export function toMusicPlayerTrack(track: Track): MusicPlayerTrack {
    return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        audioUrl: track.audioUrl,
        backgroundUrl: track.backgroundUrl,
    };
}

// Utility to extract Menu-specific data
export function toMenuTrack(track: Track): MenuTrack {
    return {
        id: track.id,
        order: track.order,
        title: track.title,
        artist: track.artist,
        creator: track.creator,
        version: track.version,
        backgroundUrl: track.backgroundUrl,
        previewTime: track.previewTime,
    };
}

// Transform API response data to Track
export function fromApiResponse(
    id: string,
    order: number,
    general: Pick<General, 'AudioFile' | 'BackgroundFile' | 'PreviewTime'>,
    metadata: Metadata
): Track {
    return {
        id,
        order,
        audioUrl: general.AudioFile,
        backgroundUrl: general.BackgroundFile,
        previewTime: general.PreviewTime,
        title: metadata.Title,
        artist: metadata.Artist,
        creator: metadata.Creator,
        version: metadata.Version,
        tags: metadata.Tags,
        beatmapSetId: metadata.BeatmapSetID,
    };
}

export function bmToMusicPlayer(bm: PlayableBeatmap): MusicPlayerTrack {
    return {
        id: bm.id,
        title: bm.title,
        artist: bm.artist,
        audioUrl: bm.audioUrl,
        backgroundUrl: bm.backgroundUrl,
        previewTime: bm.previewTime,
    };
}