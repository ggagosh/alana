CREATE TABLE "coin_price_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"coin_pair" text NOT NULL,
	"date" date NOT NULL,
	"price" real NOT NULL
);
