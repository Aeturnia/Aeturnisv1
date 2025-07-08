ALTER TABLE "monster_types" ALTER COLUMN "loot_table_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "monsters" ADD COLUMN "name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "monsters" ADD COLUMN "aggro_list" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "monsters" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;