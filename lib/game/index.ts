// Game engine exports
export { GameEngine } from './GameEngine';
export type { GameEngineCallbacks } from './GameEngine';

export { Note, createNotesFromHitObjects, resetNoteIdCounter } from './Note';
export type { NoteData } from './Note';

export { Judge } from './Judge';
export type { JudgeEvent } from './Judge';

export { useGameEngine } from './useGameEngine';
export type { UseGameEngineOptions, UseGameEngineReturn } from './useGameEngine';

// Types
export type {
    JudgeResult,
    TimingWindows,
    GameConfig,
    GameState,
    GameBeatmap,
} from './types';

// Constants
export {
    LANE_TO_DIRECTION,
    DIRECTION_TO_LANE,
    DEFAULT_TIMING_WINDOWS,
    DEFAULT_GAME_CONFIG,
    INITIAL_GAME_STATE,
    SCORE_VALUES,
    HEALTH_CHANGES,
} from './types';
