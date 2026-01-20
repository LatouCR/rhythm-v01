type DifficultyTier = {
  name: string
  max: number
  color: string
}

const difficultyTiers: DifficultyTier[] = [
  { name: "easy",        max: 2,  color: "#80FFDB" },
  { name: "normal",      max: 5,  color: "#64DFDF" },
  { name: "hard",        max: 8,  color: "#FF9E00" },
  { name: "insane",      max: 11, color: "#FF6D00" },
  { name: "chaos",       max: 14, color: "#e41125" },
  { name: "overdrive",   max: 16, color: "#3C096C" },
  { name: "apocalypse",  max: 18, color: "#7400B8" },
  { name: "transcend",   max: 20, color: "#10002B" },
]

const INFINITE = {
  name: "infinite",
  color: "#000000",
}

export function getDifficultyTier(difficulty: number) {
  return (
    difficultyTiers.find(t => difficulty <= t.max) ?? INFINITE
  )
}

/**
 * Calculate beat interval in milliseconds from BPM
 * @param bpm - Beats per minute
 * @param division - Beat division (4 = quarter note, 8 = eighth note, etc.)
 * @returns Interval in milliseconds
 */
export function getBeatInterval(bpm: number, division: number = 4): number {
  if (bpm <= 0) return 0;
  // 60000ms per minute / bpm = ms per beat (quarter note)
  // Multiply by 4/division to get the correct subdivision
  return (60000 / bpm) * (4 / division);
}

/**
 * Update the --bpm CSS variable on the document root
 * This enables CSS animations to sync with the current BPM
 * @param bpm - Beats per minute
 */
export function setBpmCssVariable(bpm: number): void {
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--bpm', bpm.toString());
  }
}