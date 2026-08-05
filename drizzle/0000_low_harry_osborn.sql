CREATE TYPE "public"."place_cost" AS ENUM('free', 'low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."place_duration" AS ENUM('quick', 'half_day', 'full_day', 'multi_day');--> statement-breakpoint
CREATE TYPE "public"."place_setting" AS ENUM('indoor', 'outdoor', 'either');--> statement-breakpoint
CREATE TYPE "public"."place_status" AS ENUM('want_to_go', 'been', 'favorite', 'ruled_out');--> statement-breakpoint
CREATE TYPE "public"."place_type" AS ENUM('outdoors', 'attraction', 'museum', 'food', 'drink', 'landmark', 'event', 'shopping', 'lodging');--> statement-breakpoint
CREATE TABLE "place_tags" (
	"place_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "place_tags_place_id_tag_id_pk" PRIMARY KEY("place_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "place_type" NOT NULL,
	"state" char(2) NOT NULL,
	"locality" text,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"geocoded_at" timestamp with time zone,
	"map_url_override" text,
	"status" "place_status" DEFAULT 'want_to_go' NOT NULL,
	"setting" "place_setting" DEFAULT 'either' NOT NULL,
	"duration" "place_duration",
	"cost" "place_cost",
	"reservation_required" boolean DEFAULT false NOT NULL,
	"priority" boolean DEFAULT false NOT NULL,
	"website_url" text,
	"source_url" text,
	"rating" integer,
	"last_visited_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rating_range" CHECK ("places"."rating" IS NULL OR ("places"."rating" BETWEEN 1 AND 5))
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_tags" ADD CONSTRAINT "place_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "places_state_idx" ON "places" USING btree ("state");--> statement-breakpoint
CREATE INDEX "places_status_idx" ON "places" USING btree ("status");--> statement-breakpoint
CREATE INDEX "places_type_idx" ON "places" USING btree ("type");--> statement-breakpoint
CREATE INDEX "places_state_locality_idx" ON "places" USING btree ("state","locality");