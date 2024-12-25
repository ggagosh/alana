create extension if not exists "pg_net" with schema "public" version '0.14.0';

alter table "public"."api_keys" alter column "date_added" set data type timestamp without time zone using "date_added"::timestamp without time zone;

alter table "public"."api_keys" alter column "last_used" set data type timestamp without time zone using "last_used"::timestamp without time zone;

alter table "public"."coin_price_history" alter column "date" set data type timestamp without time zone using "date"::timestamp without time zone;

alter table "public"."signals" alter column "date_added" set data type timestamp without time zone using "date_added"::timestamp without time zone;

alter table "public"."signals" alter column "date_shared" set data type timestamp without time zone using "date_shared"::timestamp without time zone;

alter table "public"."signals" alter column "last_price_update" set data type timestamp without time zone using "last_price_update"::timestamp without time zone;

alter table "public"."take_profits" alter column "hit_date" set data type timestamp without time zone using "hit_date"::timestamp without time zone;


