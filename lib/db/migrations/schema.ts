import { pgTable, index, unique, uuid, integer, jsonb, timestamp, real, foreignKey, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const beatmap_sets = pgTable("beatmap_sets", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	beatmap_set_id: integer().notNull(),
	general: jsonb().notNull(),
	metadata: jsonb().notNull(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("beatmap_set_id_idx").using("btree", table.beatmap_set_id.asc().nullsLast().op("int4_ops")),
	unique("beatmap_sets_beatmap_set_id_unique").on(table.beatmap_set_id),
]);

export const user_settings = pgTable("user_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	user_id: uuid().notNull(),
	volume: integer().default(70).notNull(),
	scroll_speed: real().default(1).notNull(),
	key_bindings: jsonb().default({"lane1":"D","lane2":"F","lane3":"J","lane4":"K"}).notNull(),
	last_selected_beatmap_set_id: integer(),
	last_selected_beatmap_id: integer(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("user_id_idx").using("btree", table.user_id.asc().nullsLast().op("uuid_ops")),
	unique("user_settings_user_id_unique").on(table.user_id),
]);

export const beatmaps = pgTable("beatmaps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	beatmap_set_id: integer().notNull(),
	beatmap_id: integer().notNull(),
	version: text().notNull(),
	difficulty: jsonb().notNull(),
	events: jsonb().notNull(),
	timing_points: jsonb().notNull(),
	hit_objects: jsonb().notNull(),
	created_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("beatmap_beatmap_set_id_idx").using("btree", table.beatmap_set_id.asc().nullsLast().op("int4_ops")),
	index("beatmap_id_idx").using("btree", table.beatmap_id.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.beatmap_set_id],
			foreignColumns: [beatmap_sets.beatmap_set_id],
			name: "beatmaps_beatmap_set_id_beatmap_sets_beatmap_set_id_fk"
		}).onDelete("cascade"),
	unique("beatmaps_beatmap_id_unique").on(table.beatmap_id),
]);
