ALTER TABLE "api_keys" ALTER COLUMN "date_added" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "last_used" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "coin_price_history" ALTER COLUMN "date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "signals" ALTER COLUMN "date_added" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "signals" ALTER COLUMN "last_price_update" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "signals" ALTER COLUMN "date_shared" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "take_profits" ALTER COLUMN "hit_date" SET DATA TYPE timestamp;