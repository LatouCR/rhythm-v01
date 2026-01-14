// Based on .osu file format structure for rhythm game maps
// Reference: metadata.json

export type General = {
    AudioFile: string;
    AudioLeadIn: number;
    PreviewTime: number;
    Countdown: number;
    SampleSet?: string;
    StackLeniency?: number;
    BackgroundFile: string;
    LetterboxInBreaks?: boolean;
    SpecialStyle?: boolean;
    WidescreenStoryboard: boolean;
}

export type Editor = {
    DistanceSpacing?: number;
    TimeSignature?: number;
    GridSize?: number;
    TimelineZoom?: number;
}

export type Metadata = {
    Title: string;
    Artist: string;
    Creator: string;
    Version: string; // Difficulty name (e.g., "Apocalypse", "Hard", "Expert")
    Source?: string;
    Tags: string[];
    BeatmapID: number;
    BeatmapSetID: number;
}

export type Difficulty = {
    HPDrainRate: number;
    Keys: number; // Number of keys in mania mode (4K, 7K, etc.)
    OverallDifficulty: number;
    ApproachRate: number;
    SliderMultiplier?: number;
    SliderTickRate?: number;
}

export type StoryboardLayer = {
    EventType: string;
    StartTime: number;
    [key: string]: unknown;
}

export type SoundSample = {
    Time: number;
    Layer: number;
    Filename: string;
    Volume: number;
}

export type Events = {
    BackgroundFile: string;
    BreakPeriods?: Array<{ StartTime: number; EndTime: number }>;
    Storyboard?: {
        Background: StoryboardLayer[];
        Fail: StoryboardLayer[];
        Pass: StoryboardLayer[];
        Foreground: StoryboardLayer[];
        Overlay: StoryboardLayer[];
    };
    SoundSamples?: SoundSample[];
}

export type TimingPoint = {
    StartTime: number;
    BPM?: number; // For uninherited timing points
    BeatLength?: number; // Milliseconds per beat (or slider velocity multiplier if inherited)
    TimeSignature?: number;
    SampleSet?: number;
    SampleIndex?: number;
    Volume?: number;
    Uninherited: boolean; // true = red line (BPM change), false = green line (inherited)
    Effects?: number;
}

export type HitObject = {
    StartTime: number;
    Lane: number; // Column in mania mode (0-indexed)
    EndTime?: number; // For long notes (hold notes)
    HitSound?: number;
    KeySounds?: string[];
}

// Complete map structure
export type MapData = {
    general: General;
    editor?: Editor;
    metadata: Metadata;
    difficulty: Difficulty;
    events: Events;
    timingPoints: TimingPoint[];
    hitObjects: HitObject[];
}

// Lightweight types for different loading contexts
export type MapPreview = {
    id: string;
    general: Pick<General, 'AudioFile' | 'PreviewTime' | 'WidescreenStoryboard'>;
    metadata: Metadata;
    difficulty: Pick<Difficulty, 'HPDrainRate' | 'Keys' | 'OverallDifficulty'>;
    events: Pick<Events, 'BackgroundFile'>;
}

export type TrackInfo = {
    id: string;
    general: Pick<General, 'AudioFile' | 'PreviewTime'>;
    metadata: Pick<Metadata, 'Title' | 'Artist'>;
    events: Pick<Events, 'BackgroundFile'>;
}
