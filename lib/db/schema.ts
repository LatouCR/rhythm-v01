import { pgTable, text, integer, jsonb, timestamp, uuid, index, real } from "drizzle-orm/pg-core";
import type { General, Metadata, Difficulty, Events, TimingPoint, HitObject } from "@/lib/types/Metadata";

// BeatmapSet - Unified table for menu music AND map selection
// Contains only shared metadata (General, Metadata) - used for music player
export const beatmapSets = pgTable("beatmap_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  beatmapSetID: integer("beatmap_set_id").notNull().unique(),

  // Shared data across all difficulties (JSONB matching lib/type.ts)
  // These two are ALL we need for the music player!
  general: jsonb("general").$type<General>().notNull(),   // AudioFileName, PreviewTime, Keys, BackgroundFile, etc.
  metadata: jsonb("metadata").$type<Metadata>().notNull(), // Title, Artist, Creator, Source, Tags, BeatmapID, BeatmapSetID

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  beatmapSetIDIdx: index("beatmap_set_id_idx").on(table.beatmapSetID),
}));

// Beatmap - Individual difficulty charts for a BeatmapSet
// Contains difficulty-specific data (Difficulty, Events, TimingPoints, HitObjects)
export const beatmaps = pgTable("beatmaps", {
  id: uuid("id").primaryKey().defaultRandom(),
  beatmapSetID: integer("beatmap_set_id").notNull().references(() => beatmapSets.beatmapSetID, { onDelete: "cascade" }),
  beatmapID: integer("beatmap_id").notNull().unique(),

  // Difficulty name (e.g., "Easy", "Hard", "Insane", "Apocalypse")
  version: text("version").notNull(),

  // Difficulty-specific data
  difficulty: jsonb("difficulty").$type<Difficulty>().notNull(),
  events: jsonb("events").$type<Events>().notNull(), // BreakPeriods, Storyboard, SoundSamples (difficulty-specific)

  // Heavy data - only loaded for gameplay (NOT for preview or menu music)
  timingPoints: jsonb("timing_points").$type<TimingPoint[]>().notNull(),
  hitObjects: jsonb("hit_objects").$type<HitObject[]>().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  beatmapSetIDIdx: index("beatmap_beatmap_set_id_idx").on(table.beatmapSetID),
  beatmapIDIdx: index("beatmap_id_idx").on(table.beatmapID),
}));

// Key binding configuration type
export type KeyBindings = {
  lane1: string; // e.g., "D"
  lane2: string; // e.g., "F"
  lane3: string; // e.g., "J"
  lane4: string; // e.g., "K"
  lane5?: string; // For 5K+ modes
  lane6?: string;
  lane7?: string;
  lane8?: string;
  lane9?: string;
};

// User Settings (integrated with Supabase Auth)
export const userSettings = pgTable("user_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(), // References auth.users.id from Supabase

  // Audio preferences
  volume: integer("volume").default(70).notNull(),

  // Game preferences
  scrollSpeed: real("scroll_speed").default(1.0).notNull(), // Multiplier for note speed (0.5x - 2.0x)
  keyBindings: jsonb("key_bindings").$type<KeyBindings>().default({
    lane1: "D",
    lane2: "F",
    lane3: "J",
    lane4: "K",
  }).notNull(),

  // Last played
  lastSelectedBeatmapSetID: integer("last_selected_beatmap_set_id"),
  lastSelectedBeatmapID: integer("last_selected_beatmap_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

// Inferred types for TypeScript
export type BeatmapSet = typeof beatmapSets.$inferSelect;
export type NewBeatmapSet = typeof beatmapSets.$inferInsert;

export type Beatmap = typeof beatmaps.$inferSelect;
export type NewBeatmap = typeof beatmaps.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
