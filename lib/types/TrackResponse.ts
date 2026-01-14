import { General, Metadata } from "./Metadata"

export interface Track {
    id: string;
    order: number;
    audioUrl: string;
    backgroundUrl: string;
    previewTime: number;
    title: string;
    artist: string;
}

export interface TrackResponse {
    tracks: Track[];
}