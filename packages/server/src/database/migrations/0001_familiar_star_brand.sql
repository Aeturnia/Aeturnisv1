CREATE TABLE IF NOT EXISTS "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"name" varchar(32) NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"experience" bigint DEFAULT 0 NOT NULL,
	"race" varchar(20) NOT NULL,
	"class" varchar(20) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"base_strength" integer DEFAULT 10 NOT NULL,
	"base_dexterity" integer DEFAULT 10 NOT NULL,
	"base_intelligence" integer DEFAULT 10 NOT NULL,
	"base_wisdom" integer DEFAULT 10 NOT NULL,
	"base_constitution" integer DEFAULT 10 NOT NULL,
	"base_charisma" integer DEFAULT 10 NOT NULL,
	"strength_tier" integer DEFAULT 0 NOT NULL,
	"dexterity_tier" integer DEFAULT 0 NOT NULL,
	"intelligence_tier" integer DEFAULT 0 NOT NULL,
	"wisdom_tier" integer DEFAULT 0 NOT NULL,
	"constitution_tier" integer DEFAULT 0 NOT NULL,
	"charisma_tier" integer DEFAULT 0 NOT NULL,
	"bonus_strength" bigint DEFAULT 0 NOT NULL,
	"bonus_dexterity" bigint DEFAULT 0 NOT NULL,
	"bonus_intelligence" bigint DEFAULT 0 NOT NULL,
	"bonus_wisdom" bigint DEFAULT 0 NOT NULL,
	"bonus_constitution" bigint DEFAULT 0 NOT NULL,
	"bonus_charisma" bigint DEFAULT 0 NOT NULL,
	"prestige_level" integer DEFAULT 0 NOT NULL,
	"paragon_points" bigint DEFAULT 0 NOT NULL,
	"paragon_distribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"current_hp" bigint DEFAULT 100 NOT NULL,
	"max_hp" bigint DEFAULT 100 NOT NULL,
	"current_mp" bigint DEFAULT 100 NOT NULL,
	"max_mp" bigint DEFAULT 100 NOT NULL,
	"current_stamina" bigint DEFAULT 100 NOT NULL,
	"max_stamina" bigint DEFAULT 100 NOT NULL,
	"gold" bigint DEFAULT 100 NOT NULL,
	"bank_slots" integer DEFAULT 20 NOT NULL,
	"appearance" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"current_zone" varchar(50) DEFAULT 'starter_zone' NOT NULL,
	"position" jsonb DEFAULT '{"x":0,"y":0,"z":0}'::jsonb NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"last_played_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "characters_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "currency_exchange" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_currency" varchar(10) DEFAULT 'gold' NOT NULL,
	"to_currency" varchar(10) NOT NULL,
	"rate" numeric(10, 4) NOT NULL,
	"active_from" timestamp DEFAULT now() NOT NULL,
	"active_to" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "personal_banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"slot" integer NOT NULL,
	"item_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slot" integer NOT NULL,
	"item_id" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"last_accessed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" bigint NOT NULL,
	"balance_before" bigint NOT NULL,
	"balance_after" bigint NOT NULL,
	"related_character_id" uuid,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "characters" ADD CONSTRAINT "characters_account_id_users_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "personal_banks" ADD CONSTRAINT "personal_banks_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_banks" ADD CONSTRAINT "shared_banks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_banks" ADD CONSTRAINT "shared_banks_last_accessed_by_characters_id_fk" FOREIGN KEY ("last_accessed_by") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_related_character_id_characters_id_fk" FOREIGN KEY ("related_character_id") REFERENCES "public"."characters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_characters_account_deleted" ON "characters" USING btree ("account_id","is_deleted");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_characters_name" ON "characters" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_characters_level" ON "characters" USING btree ("level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_characters_prestige" ON "characters" USING btree ("prestige_level");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_exchange_currencies" ON "currency_exchange" USING btree ("from_currency","to_currency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_exchange_active" ON "currency_exchange" USING btree ("active_from","active_to");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_bank_char_slot" ON "personal_banks" USING btree ("character_id","slot");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_bank_char_slot" ON "personal_banks" USING btree ("character_id","slot");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_shared_bank_user_slot" ON "shared_banks" USING btree ("user_id","slot");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_shared_bank_user_slot" ON "shared_banks" USING btree ("user_id","slot");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_char_created" ON "transactions" USING btree ("character_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transaction_related_char" ON "transactions" USING btree ("related_character_id");