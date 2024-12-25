create extension if not exists "pg_net" with schema "public" version '0.14.0';

create sequence "public"."coin_price_history_id_seq";

create table "public"."coin_price_history" (
    "id" integer not null default nextval('coin_price_history_id_seq'::regclass),
    "coin_pair" text not null,
    "date" date not null,
    "price" real not null
);


alter sequence "public"."coin_price_history_id_seq" owned by "public"."coin_price_history"."id";

CREATE UNIQUE INDEX coin_price_history_pkey ON public.coin_price_history USING btree (id);

alter table "public"."coin_price_history" add constraint "coin_price_history_pkey" PRIMARY KEY using index "coin_price_history_pkey";

grant delete on table "public"."coin_price_history" to "anon";

grant insert on table "public"."coin_price_history" to "anon";

grant references on table "public"."coin_price_history" to "anon";

grant select on table "public"."coin_price_history" to "anon";

grant trigger on table "public"."coin_price_history" to "anon";

grant truncate on table "public"."coin_price_history" to "anon";

grant update on table "public"."coin_price_history" to "anon";

grant delete on table "public"."coin_price_history" to "authenticated";

grant insert on table "public"."coin_price_history" to "authenticated";

grant references on table "public"."coin_price_history" to "authenticated";

grant select on table "public"."coin_price_history" to "authenticated";

grant trigger on table "public"."coin_price_history" to "authenticated";

grant truncate on table "public"."coin_price_history" to "authenticated";

grant update on table "public"."coin_price_history" to "authenticated";

grant delete on table "public"."coin_price_history" to "service_role";

grant insert on table "public"."coin_price_history" to "service_role";

grant references on table "public"."coin_price_history" to "service_role";

grant select on table "public"."coin_price_history" to "service_role";

grant trigger on table "public"."coin_price_history" to "service_role";

grant truncate on table "public"."coin_price_history" to "service_role";

grant update on table "public"."coin_price_history" to "service_role";


