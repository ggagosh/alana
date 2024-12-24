CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"secret" text NOT NULL,
	"date_added" date NOT NULL,
	"last_used" date,
	CONSTRAINT "api_keys_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "signals" (
	"id" serial PRIMARY KEY NOT NULL,
	"date_added" date NOT NULL,
	"last_price_update" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"coin_pair" text NOT NULL,
	"entry_low" real NOT NULL,
	"entry_high" real NOT NULL,
	"current_price" real NOT NULL,
	"stop_loss" real NOT NULL,
	"date_shared" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "take_profits" (
	"id" serial PRIMARY KEY NOT NULL,
	"signal_id" integer NOT NULL,
	"level" integer NOT NULL,
	"price" real NOT NULL,
	"hit" boolean DEFAULT false NOT NULL,
	"hit_date" date
);
--> statement-breakpoint
ALTER TABLE "take_profits" ADD CONSTRAINT "take_profits_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE cascade ON UPDATE no action;