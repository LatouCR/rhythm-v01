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