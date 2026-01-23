/**
 * Beat division types for the metronome
 * 1/1 = whole note (4 beats), 1/2 = half note (2 beats),
 * 1/4 = quarter note (1 beat), 1/8 = eighth note (0.5 beats),
 * 1/16 = sixteenth note (0.25 beats)
 */
export type BeatDivision = '1/1' | '1/2' | '1/4' | '1/8' | '1/16'

const DIVISION_MULTIPLIERS: Record<BeatDivision, number> = {
  '1/1': 4,    // Whole note = 4 quarter notes
  '1/2': 2,    // Half note = 2 quarter notes
  '1/4': 1,    // Quarter note = 1 beat (standard)
  '1/8': 0.5,  // Eighth note = half a beat
  '1/16': 0.25 // Sixteenth note = quarter of a beat
}

export interface BeatInfo {
  lastBeatPosition: number      // Position of the last beat in ms
  nextBeatPosition: number      // Position of the next beat in ms
  beatIndex: number             // Current beat index (0-based)
  progressToNextBeat: number    // 0-1 progress toward next beat
}

/**
 * Metronome class for rhythm-based beat calculations
 * Handles BPM timing, beat divisions, and position tracking
 * TODO: Add offset handling for sync adjustments - beatmap offset only.
 */
export class Metronome {
  private _bpm: number
  private _division: BeatDivision

  constructor(bpm: number = 120, division: BeatDivision = '1/4') {
    this._bpm = Math.max(1, bpm)
    this._division = division
  }

  // Getters
  get bpm(): number {
    return this._bpm
  }

  get division(): BeatDivision {
    return this._division
  }

  /**
   * Duration of one quarter note beat in milliseconds
   */
  get quarterNoteDurationMs(): number {
    return 60000 / this._bpm
  }

  /**
   * Duration of one quarter note beat in seconds
   */
  get quarterNoteDurationSec(): number {
    return 60 / this._bpm
  }

  /**
   * Duration of the current division in milliseconds
   */
  get beatDurationMs(): number {
    return this.quarterNoteDurationMs * DIVISION_MULTIPLIERS[this._division]
  }

  /**
   * Duration of the current division in seconds
   */
  get beatDurationSec(): number {
    return this.quarterNoteDurationSec * DIVISION_MULTIPLIERS[this._division]
  }

  // Setters
  setBpm(bpm: number): void {
    this._bpm = Math.max(1, bpm)
    this.updateCssVariable()
  }

  setDivision(division: BeatDivision): void {
    this._division = division
  }

  /**
   * Update the --bpm CSS variable on the document root
   * This enables CSS animations to sync with the current BPM
   */
  updateCssVariable(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--bpm', this._bpm.toString())
    }
  }

  /**
   * Calculate beat information based on the current music position
   * @param currentTimeMs - Current playback position in milliseconds
   * @returns BeatInfo object with timing information
   */
  getBeatInfo(currentTimeMs: number): BeatInfo {
    const beatDuration = this.beatDurationMs

    // Calculate which beat we're on
    const beatIndex = Math.floor(currentTimeMs / beatDuration)

    // Position of the last beat
    const lastBeatPosition = beatIndex * beatDuration

    // Position of the next beat
    const nextBeatPosition = (beatIndex + 1) * beatDuration

    // Progress toward the next beat (0 to 1)
    const timeInCurrentBeat = currentTimeMs - lastBeatPosition
    const progressToNextBeat = timeInCurrentBeat / beatDuration

    return {
      lastBeatPosition,
      nextBeatPosition,
      beatIndex,
      progressToNextBeat
    }
  }

  /**
   * Calculate beat info from seconds (convenience method)
   * @param currentTimeSec - Current playback position in seconds
   */
  getBeatInfoFromSeconds(currentTimeSec: number): BeatInfo {
    return this.getBeatInfo(currentTimeSec * 1000)
  }

  /**
   * Get the position of a specific beat index in milliseconds
   * @param beatIndex - The beat number (0-based)
   */
  getBeatPositionMs(beatIndex: number): number {
    return beatIndex * this.beatDurationMs
  }

  /**
   * Get the position of a specific beat index in seconds
   * @param beatIndex - The beat number (0-based)
   */
  getBeatPositionSec(beatIndex: number): number {
    return beatIndex * this.beatDurationSec
  }

  /**
   * Calculate how many beats fit in a given duration
   * @param durationMs - Duration in milliseconds
   */
  getBeatsInDuration(durationMs: number): number {
    return Math.floor(durationMs / this.beatDurationMs)
  }

  /**
   * Get time until the next beat from current position
   * @param currentTimeMs - Current playback position in milliseconds
   */
  getTimeUntilNextBeatMs(currentTimeMs: number): number {
    const { nextBeatPosition } = this.getBeatInfo(currentTimeMs)
    return nextBeatPosition - currentTimeMs
  }

  /**
   * Get time since the last beat from current position
   * @param currentTimeMs - Current playback position in milliseconds
   */
  getTimeSinceLastBeatMs(currentTimeMs: number): number {
    const { lastBeatPosition } = this.getBeatInfo(currentTimeMs)
    return currentTimeMs - lastBeatPosition
  }
}

// Global metronome instance for shared state
let globalMetronome: Metronome | null = null

export function getMetronome(): Metronome {
  if (!globalMetronome) {
    globalMetronome = new Metronome()
  }
  return globalMetronome
}

export function createMetronome(bpm?: number, division?: BeatDivision): Metronome {
  return new Metronome(bpm, division)
}
