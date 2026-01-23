import type { HitObject } from '@/lib/types/Metadata';
import type { ArrowDirection } from '@/components/Sprites/Arrow';
import type { GameConfig, GameState, GameBeatmap } from './types';
import { DEFAULT_GAME_CONFIG, INITIAL_GAME_STATE, HEALTH_CHANGES } from './types';
import { Note, createNotesFromHitObjects, resetNoteIdCounter } from './Note';
import { Judge, type JudgeEvent } from './Judge';
import testBM from './testBeatmap';

export interface GameEngineCallbacks {
    onStateChange?: (state: GameState) => void;
    onJudge?: (event: JudgeEvent) => void;
    onGameEnd?: (state: GameState) => void;
}

export class GameEngine {
    private config: GameConfig;
    private state: GameState;
    private allNotes: Note[] = [];
    private judge: Judge;
    private callbacks: GameEngineCallbacks;

    private beatmap: GameBeatmap | null = null;
    private startTime: number = 0;
    private pausedTime: number = 0;
    private animationFrameId: number | null = null;

    // Key state tracking to prevent key repeat
    private keyHeldState: Record<ArrowDirection, boolean> = {
        left: false,
        up: false,
        down: false,
        right: false,
    };

    constructor(config: Partial<GameConfig> = {}, callbacks: GameEngineCallbacks = {}) {
        this.config = { ...DEFAULT_GAME_CONFIG, ...config };
        this.state = { ...INITIAL_GAME_STATE };
        this.callbacks = callbacks;

        this.judge = new Judge(this.config.timingWindows, (event) => {
            this.handleJudgeEvent(event);
        });
    }

    /**
     * Update game configuration
     */
    updateConfig(config: Partial<GameConfig>): void {
        this.config = { ...this.config, ...config };
        if (config.timingWindows) {
            this.judge.updateTimingWindows(config.timingWindows);
        }
    }

    /**
     * Load a beatmap for gameplay
     */
    loadBeatmap(beatmap: GameBeatmap): void {
        resetNoteIdCounter();
        this.beatmap = beatmap;
        this.allNotes = createNotesFromHitObjects(beatmap.hitObjects);
        this.state = { ...INITIAL_GAME_STATE };

        console.log(`[GameEngine] Loaded beatmap: ${beatmap.title} with ${this.allNotes.length} notes`);
    }

    /**
     * Generate test notes (notes on lane 0 every 3 seconds for 60 seconds)
     */
    loadTestPattern(): void {
        resetNoteIdCounter();

        const testHitObjects: HitObject[] = [];
        const duration = 60000; // 60 seconds
        const interval = 3000; // 3 seconds

        // for (let time = interval; time <= duration; time += interval) {
        //     let lane = 0;
        //     testHitObjects.push({
        //         StartTime: time,
        //         Lane: lane, // Lane 0 = left
        //         HitSound: 0,
        //         KeySounds: [],
        //     });
        //     lane = (lane + 1) % 4;
        // }

        this.beatmap = {
            id: 'test-pattern',
            title: 'Test Pattern',
            artist: 'System',
            audioUrl: '',
            backgroundUrl: '',
            duration,
            bpm: 120,
            hitObjects: testBM,
            timingPoints: [{ StartTime: 0, BPM: 120, Uninherited: true }],
        };

        this.allNotes = createNotesFromHitObjects(testBM);
        this.state = { ...INITIAL_GAME_STATE };

        console.log(`[GameEngine] Loaded test pattern: ${this.allNotes.length} notes (every 3s for 60s on lane 0)`);
    }

    /**
     * Start the game
     */
    start(): void {
        if (this.state.isPlaying) return;

        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.startTime = performance.now();

        console.log('[GameEngine] Game started');
        this.emitStateChange();
        this.gameLoop();
    }

    /**
     * Pause the game
     */
    pause(): void {
        if (!this.state.isPlaying || this.state.isPaused) return;

        this.state.isPaused = true;
        this.pausedTime = performance.now();

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('[GameEngine] Game paused');
        this.emitStateChange();
    }

    /**
     * Resume the game
     */
    resume(): void {
        if (!this.state.isPlaying || !this.state.isPaused) return;

        // Adjust start time to account for pause duration
        const pauseDuration = performance.now() - this.pausedTime;
        this.startTime += pauseDuration;

        this.state.isPaused = false;

        console.log('[GameEngine] Game resumed');
        this.emitStateChange();
        this.gameLoop();
    }

    /**
     * Stop the game
     */
    stop(): void {
        this.state.isPlaying = false;
        this.state.isPaused = false;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('[GameEngine] Game stopped');
        this.emitStateChange();
    }

    /**
     * Reset the game to initial state
     */
    reset(): void {
        this.stop();

        if (this.beatmap) {
            resetNoteIdCounter();
            this.allNotes = createNotesFromHitObjects(this.beatmap.hitObjects);
        }

        this.state = { ...INITIAL_GAME_STATE };
        this.keyHeldState = { left: false, up: false, down: false, right: false };

        console.log('[GameEngine] Game reset');
        this.emitStateChange();
    }

    /**
     * Handle key down event
     */
    onKeyDown(direction: ArrowDirection): void {
        if (!this.state.isPlaying || this.state.isPaused) return;
        if (this.keyHeldState[direction]) return; // Ignore key repeat

        this.keyHeldState[direction] = true;

        // Find and judge the best hittable note in this lane
        const hittableNote = this.judge.findHittableNote(
            this.allNotes,
            direction,
            this.state.currentTime
        );

        if (hittableNote) {
            this.judge.judgeHit(hittableNote, this.state.currentTime, this.state);
        }
    }

    /**
     * Handle key up event
     */
    onKeyUp(direction: ArrowDirection): void {
        this.keyHeldState[direction] = false;
    }

    /**
     * Get current game state (immutable copy)
     */
    getState(): GameState {
        return { ...this.state };
    }

    /**
     * Get all notes (for rendering)
     * Returns notes that are visible based on approach time
     */
    getVisibleNotes(): Note[] {
        const { currentTime } = this.state;
        const { approachTime } = this.config;

        return this.allNotes.filter(note => {
            // Note is visible if:
            // 1. It's within the approach window (coming up)
            // 2. It's been judged but still in view (for visual feedback)
            const timeUntilHit = note.startTime - currentTime;
            const timeSinceHit = currentTime - note.startTime;

            // Show notes that are approaching (up to approachTime before hit)
            // and notes that were recently judged (up to 500ms after for feedback)
            return timeUntilHit <= approachTime && timeSinceHit <= 500;
        });
    }

    /**
     * Get pending (unjudged) notes
     */
    getPendingNotes(): Note[] {
        return this.allNotes.filter(note => !note.isJudged());
    }

    /**
     * Get game configuration
     */
    getConfig(): GameConfig {
        return { ...this.config };
    }

    /**
     * Get beatmap info
     */
    getBeatmap(): GameBeatmap | null {
        return this.beatmap;
    }

    /**
     * Get current time
     */
    getCurrentTime(): number {
        return this.state.currentTime;
    }

    /**
     * Main game loop
     */
    private gameLoop = (): void => {
        if (!this.state.isPlaying || this.state.isPaused) return;

        // Update current time
        this.state.currentTime = performance.now() - this.startTime;

        // Process auto-misses for notes that passed the hit window
        this.judge.processAutoMiss(this.allNotes, this.state.currentTime, this.state);

        // Check if game has ended
        this.checkGameEnd();

        // Continue loop
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    /**
     * Check if game has ended
     */
    private checkGameEnd(): void {
        if (!this.beatmap) return;

        // Game ends when all notes are judged
        const allNotesJudged = this.allNotes.every(note => note.isJudged());
        const timeExceeded = this.state.currentTime >= this.beatmap.duration + 2000;

        if (allNotesJudged || timeExceeded) {
            this.stop();

            const accuracy = Judge.calculateAccuracy(this.state);
            const grade = Judge.getGrade(accuracy);

            console.log('[GameEngine] ===== GAME ENDED =====');
            console.log(`[GameEngine] Final Score: ${Math.round(this.state.score)}`);
            console.log(`[GameEngine] Accuracy: ${accuracy.toFixed(2)}%`);
            console.log(`[GameEngine] Grade: ${grade}`);
            console.log(`[GameEngine] Max Combo: ${this.state.maxCombo}`);
            console.log(`[GameEngine] Perfect: ${this.state.marks.perfect} | Good: ${this.state.marks.good} | Offbeat: ${this.state.marks.offbeat} | Miss: ${this.state.marks.miss}`);

            if (this.callbacks.onGameEnd) {
                this.callbacks.onGameEnd(this.state);
            }
        }
    }

    /**
     * Handle judge events from the Judge class
     */
    private handleJudgeEvent(event: JudgeEvent): void {
        const { result, combo, score } = event;

        // Update state
        this.state.combo = combo;
        this.state.maxCombo = Math.max(this.state.maxCombo, combo);
        this.state.score += score;
        this.state.marks[result]++;

        // Update health
        const healthChange = HEALTH_CHANGES[result];
        this.state.health = Math.max(0, Math.min(100, this.state.health + healthChange));

        this.emitStateChange();

        if (this.callbacks.onJudge) {
            this.callbacks.onJudge(event);
        }
    }

    /**
     * Emit state change callback
     */
    private emitStateChange(): void {
        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange(this.getState());
        }
    }

    /**
     * Destroy the engine and clean up
     */
    destroy(): void {
        this.stop();
        this.allNotes = [];
        this.beatmap = null;
        console.log('[GameEngine] Destroyed');
    }
}
