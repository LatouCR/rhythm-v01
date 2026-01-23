import type { HitObject } from '@/lib/types/Metadata';
import type { ArrowDirection } from '@/components/Sprites/Arrow';
import type { JudgeResult } from './types';
import { LANE_TO_DIRECTION } from './types';

let noteIdCounter = 0;

export interface NoteData {
    id: string;
    lane: number;
    direction: ArrowDirection;
    startTime: number; // ms - when the note should be hit
    endTime: number | null; // ms - for hold notes
    isHit: boolean;
    isMissed: boolean;
    judgeResult: JudgeResult | null;
}

export class Note implements NoteData {
    id: string;
    lane: number;
    direction: ArrowDirection;
    startTime: number;
    endTime: number | null;
    isHit: boolean;
    isMissed: boolean;
    judgeResult: JudgeResult | null;

    constructor(hitObject: HitObject) {
        this.id = `note-${noteIdCounter++}`;
        this.lane = hitObject.Lane;
        this.direction = LANE_TO_DIRECTION[hitObject.Lane] ?? 'left';
        this.startTime = hitObject.StartTime;
        this.endTime = hitObject.EndTime ?? null;
        this.isHit = false;
        this.isMissed = false;
        this.judgeResult = null;
    }

    /**
     * Get the time offset from target hit time
     * Negative = note is in the future (hasn't reached hit line yet)
     * Positive = note is in the past (passed the hit line)
     */
    getTimeOffset(currentTime: number): number {
        return currentTime - this.startTime;
    }

    /**
     * Check if the note should be considered missed (passed hit window)
     */
    shouldAutoMiss(currentTime: number, hitWindowMiss: number): boolean {
        if (this.isHit || this.isMissed) return false;
        return this.getTimeOffset(currentTime) > hitWindowMiss;
    }

    /**
     * Check if this note is within the hittable window
     */
    isHittable(currentTime: number, hitWindowMiss: number): boolean {
        if (this.isHit || this.isMissed) return false;
        const offset = Math.abs(this.getTimeOffset(currentTime));
        return offset <= hitWindowMiss;
    }

    /**
     * Mark the note as hit with a judge result
     */
    hit(result: JudgeResult): void {
        this.isHit = true;
        this.judgeResult = result;
    }

    /**
     * Mark the note as missed
     */
    miss(): void {
        this.isMissed = true;
        this.judgeResult = 'miss';
    }

    /**
     * Check if this note is a hold note
     */
    isHoldNote(): boolean {
        return this.endTime !== null && this.endTime > this.startTime;
    }

    /**
     * Get hold note duration in ms
     */
    getHoldDuration(): number {
        if (!this.isHoldNote()) return 0;
        return this.endTime! - this.startTime;
    }

    /**
     * Check if the note has been judged (hit or missed)
     */
    isJudged(): boolean {
        return this.isHit || this.isMissed;
    }
}

/**
 * Create notes from hit objects
 */
export function createNotesFromHitObjects(hitObjects: HitObject[]): Note[] {
    return hitObjects.map(ho => new Note(ho));
}

/**
 * Reset note ID counter (useful for starting new games)
 */
export function resetNoteIdCounter(): void {
    noteIdCounter = 0;
}
