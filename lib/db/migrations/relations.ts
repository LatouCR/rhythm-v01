import { relations } from "drizzle-orm/relations";
import { beatmap_sets, beatmaps } from "./schema";

export const beatmapsRelations = relations(beatmaps, ({one}) => ({
	beatmap_set: one(beatmap_sets, {
		fields: [beatmaps.beatmap_set_id],
		references: [beatmap_sets.beatmap_set_id]
	}),
}));

export const beatmap_setsRelations = relations(beatmap_sets, ({many}) => ({
	beatmaps: many(beatmaps),
}));