import type { TimingWindows, JudgeResult, GameState } from './types';
import { SCORE_VALUES, HEALTH_CHANGES } from './types';
import type { Note } from './Note';
import type { ArrowDirection } from '@/components/Sprites/Arrow';

export interface JudgeEvent {
    note: Note;
    result: JudgeResult;
    timeDiff: number; // How early/late the hit was (negative = early, positive = late)
    combo: number;
    score: number;
}

export class Judge {
    private timingWindows: TimingWindows;
    private onJudge?: (event: JudgeEvent) => void;

    constructor(timingWindows: TimingWindows, onJudge?: (event: JudgeEvent) => void) {
        this.timingWindows = timingWindows;
        this.onJudge = onJudge;
    }

    /**
     * Update the timing windows
     */
    updateTimingWindows(windows: TimingWindows): void {
        this.timingWindows = windows;
    }

    /**
     * Determine the judge result based on timing offset
     */
    private getJudgeResult(absTimeDiff: number): JudgeResult {
        if (absTimeDiff <= this.timingWindows.perfect) {
            return 'perfect';
        } else if (absTimeDiff <= this.timingWindows.good) {
            return 'good';
        } else if (absTimeDiff <= this.timingWindows.offbeat) {
            return 'offbeat';
        }
        return 'miss';
    }

    /**
     * Judge a hit attempt on a note
     * Returns the judge result and updates game state
     */
    judgeHit(note: Note, currentTime: number, state: GameState): JudgeResult {
        const timeDiff = note.getTimeOffset(currentTime);
        const absTimeDiff = Math.abs(timeDiff);

        const result = this.getJudgeResult(absTimeDiff);
        const baseScore = SCORE_VALUES[result];

        // Update note state
        if (result === 'miss') {
            note.miss();
        } else {
            note.hit(result);
        }

        // Calculate combo and score
        const newCombo = result === 'miss' ? 0 : state.combo + 1;
        const comboMultiplier = 1 + Math.min(newCombo / 10, 2); // Max 3x at 20+ combo
        const finalScore = Math.round(baseScore * comboMultiplier);

        // Log judge result to console
        const earlyLate = timeDiff < 0 ? 'EARLY' : timeDiff > 0 ? 'LATE' : 'PERFECT';
        console.log(
            `[Judge] ${result.toUpperCase()} (${earlyLate}) | ` +
            `Timing: ${timeDiff >= 0 ? '+' : ''}${timeDiff.toFixed(1)}ms | ` +
            `Combo: ${newCombo} | Score: +${finalScore}`
        );

        // Fire callback
        if (this.onJudge) {
            this.onJudge({
                note,
                result,
                timeDiff,
                combo: newCombo,
                score: finalScore,
            });
        }

        return result;
    }

    /**
     * Find the best note to hit in a given lane at the current time
     * Returns the note closest to the target time within the hit window
     */
    findHittableNote(notes: Note[], direction: ArrowDirection, currentTime: number): Note | null {
        let bestNote: Note | null = null;
        let bestOffset = Infinity;

        for (const note of notes) {
            // Skip notes that don't match the direction or are already judged
            if (note.direction !== direction || note.isJudged()) continue;

            // Check if note is within the hittable window
            if (!note.isHittable(currentTime, this.timingWindows.miss)) continue;

            // Find the note with the smallest absolute time offset
            const offset = Math.abs(note.getTimeOffset(currentTime));
            if (offset < bestOffset) {
                bestOffset = offset;
                bestNote = note;
            }
        }

        return bestNote;
    }

    /**
     * Process auto-miss for notes that passed the hit window
     */
    processAutoMiss(notes: Note[], currentTime: number, state: GameState): Note[] {
        const missedNotes: Note[] = [];

        for (const note of notes) {
            if (note.shouldAutoMiss(currentTime, this.timingWindows.miss)) {
                note.miss();
                missedNotes.push(note);

                const timeDiff = note.getTimeOffset(currentTime);
                console.log(
                    `[Judge] AUTO MISS | Lane: ${note.lane} (${note.direction}) | ` +
                    `Target: ${note.startTime}ms | Missed by: ${timeDiff.toFixed(1)}ms`
                );

                if (this.onJudge) {
                    this.onJudge({
                        note,
                        result: 'miss',
                        timeDiff,
                        combo: 0,
                        score: 0,
                    });
                }
            }
        }

        return missedNotes;
    }

    /**
     * Calculate accuracy percentage from game state
     */
    static calculateAccuracy(state: GameState): number {
        const { marks } = state;
        const totalNotes = marks.perfect + marks.good + marks.offbeat + marks.miss;

        if (totalNotes === 0) return 100;

        const weightedScore =
            (marks.perfect * SCORE_VALUES.perfect) +
            (marks.good * SCORE_VALUES.good) +
            (marks.offbeat * SCORE_VALUES.offbeat);

        return (weightedScore / (totalNotes * SCORE_VALUES.perfect)) * 100;
    }

    /**
     * Get grade based on accuracy
     */
    static getGrade(accuracy: number): string {
        if (accuracy >= 95) return 'S';
        if (accuracy >= 90) return 'A';
        if (accuracy >= 80) return 'B';
        if (accuracy >= 70) return 'C';
        if (accuracy >= 60) return 'D';
        return 'F';
    }

    /**
     * Get timing windows
     */
    getTimingWindows(): TimingWindows {
        return { ...this.timingWindows };
    }
}
