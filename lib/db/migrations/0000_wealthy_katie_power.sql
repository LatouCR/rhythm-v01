-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "beatmap_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beatmap_set_id" integer NOT NULL,
	"general" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "beatmap_sets_beatmap_set_id_unique" UNIQUE("beatmap_set_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"volume" integer DEFAULT 70 NOT NULL,
	"scroll_speed" real DEFAULT 1 NOT NULL,
	"key_bindings" jsonb DEFAULT '{"lane1":"D","lane2":"F","lane3":"J","lane4":"K"}'::jsonb NOT NULL,
	"last_selected_beatmap_set_id" integer,
	"last_selected_beatmap_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "beatmaps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beatmap_set_id" integer NOT NULL,
	"beatmap_id" integer NOT NULL,
	"version" text NOT NULL,
	"difficulty" jsonb NOT NULL,
	"events" jsonb NOT NULL,
	"timing_points" jsonb NOT NULL,
	"hit_objects" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "beatmaps_beatmap_id_unique" UNIQUE("beatmap_id")
);
--> statement-breakpoint
ALTER TABLE "beatmaps" ADD CONSTRAINT "beatmaps_beatmap_set_id_beatmap_sets_beatmap_set_id_fk" FOREIGN KEY ("beatmap_set_id") REFERENCES "public"."beatmap_sets"("beatmap_set_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "beatmap_set_id_idx" ON "beatmap_sets" USING btree ("beatmap_set_id" int4_ops);--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "user_settings" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "beatmap_beatmap_set_id_idx" ON "beatmaps" USING btree ("beatmap_set_id" int4_ops);--> statement-breakpoint
CREATE INDEX "beatmap_id_idx" ON "beatmaps" USING btree ("beatmap_id" int4_ops);
*/