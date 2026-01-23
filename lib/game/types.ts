import type { HitObject, TimingPoint } from '@/lib/types/Metadata';
import type { ArrowDirection } from '@/components/Sprites/Arrow';

// Judge result types
export type JudgeResult = 'perfect' | 'good' | 'offbeat' | 'miss';

// Lane mapping (0-indexed lane to direction)
export const LANE_TO_DIRECTION: Record<number, ArrowDirection> = {
    0: 'left',
    1: 'up',
    2: 'down',
    3: 'right',
};

export const DIRECTION_TO_LANE: Record<ArrowDirection, number> = {
    left: 0,
    up: 1,
    down: 2,
    right: 3,
};

// Timing windows configuration (in milliseconds)
export interface TimingWindows {
    perfect: number; // ±ms for perfect
    good: number; // ±ms for good
    offbeat: number; // ±ms for offbeat
    miss: number; // ±ms before auto-miss
}

// Game configuration (timing-based)
export interface GameConfig {
    timingWindows: TimingWindows;
    scrollSpeed: number; // How fast notes scroll (pixels per ms) - used by renderer
    approachTime: number; // How long before hit time a note becomes visible (ms)
    laneCount: number;
}

// Game state
export interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    currentTime: number; // ms from song start
    score: number;
    combo: number;
    maxCombo: number;
    health: number;
    marks: {
        perfect: number;
        good: number;
        offbeat: number;
        miss: number;
    };
}

// Beatmap data for gameplay
export interface GameBeatmap {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    backgroundUrl: string;
    duration: number; // ms
    bpm: number;
    hitObjects: HitObject[];
    timingPoints: TimingPoint[];
}

// Default timing windows
export const DEFAULT_TIMING_WINDOWS: TimingWindows = {
    perfect: 50, // ±50ms
    good: 100, // ±100ms
    offbeat: 150, // ±150ms
    miss: 200, // ±200ms (auto-miss after this)
};

// Default game configuration
export const DEFAULT_GAME_CONFIG: GameConfig = {
    timingWindows: DEFAULT_TIMING_WINDOWS,
    scrollSpeed: 0.5, // pixels per ms (500px per second)
    approachTime: 2000, // notes visible 2 seconds before hit
    laneCount: 4,
};

// Initial game state
export const INITIAL_GAME_STATE: GameState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    marks: {
        perfect: 0,
        good: 0,
        offbeat: 0,
        miss: 0,
    },
};

// Score values for each judge result
export const SCORE_VALUES: Record<JudgeResult, number> = {
    perfect: 100,
    good: 70,
    offbeat: 30,
    miss: 0,
};

// Health changes for each judge result
export const HEALTH_CHANGES: Record<JudgeResult, number> = {
    perfect: 2,
    good: 1,
    offbeat: 0,
    miss: -5,
};
