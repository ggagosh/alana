

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "timescaledb" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "key" "text" NOT NULL,
    "secret" "text" NOT NULL,
    "date_added" "date" NOT NULL,
    "last_used" "date",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."api_keys" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."api_keys_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."api_keys_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."api_keys_id_seq" OWNED BY "public"."api_keys"."id";



CREATE TABLE IF NOT EXISTS "public"."signals" (
    "id" integer NOT NULL,
    "date_added" "date" NOT NULL,
    "last_price_update" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "coin_pair" "text" NOT NULL,
    "entry_low" real NOT NULL,
    "entry_high" real NOT NULL,
    "current_price" real NOT NULL,
    "stop_loss" real NOT NULL,
    "date_shared" "date" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."signals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."signals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."signals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."signals_id_seq" OWNED BY "public"."signals"."id";



CREATE TABLE IF NOT EXISTS "public"."take_profits" (
    "id" integer NOT NULL,
    "signal_id" integer NOT NULL,
    "level" integer NOT NULL,
    "price" real NOT NULL,
    "hit" boolean DEFAULT false NOT NULL,
    "hit_date" "date"
);


ALTER TABLE "public"."take_profits" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."take_profits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."take_profits_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."take_profits_id_seq" OWNED BY "public"."take_profits"."id";



ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."api_keys" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."api_keys_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."signals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."signals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."take_profits" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."take_profits_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."signals"
    ADD CONSTRAINT "signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."take_profits"
    ADD CONSTRAINT "take_profits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signals"
    ADD CONSTRAINT "signals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."take_profits"
    ADD CONSTRAINT "take_profits_signal_id_signals_id_fk" FOREIGN KEY ("signal_id") REFERENCES "public"."signals"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";





















































































































































































































GRANT ALL ON FUNCTION "public"."add_compression_policy"("hypertable" "regclass", "compress_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "compress_created_before" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."add_compression_policy"("hypertable" "regclass", "compress_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "compress_created_before" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."add_compression_policy"("hypertable" "regclass", "compress_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "compress_created_before" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_compression_policy"("hypertable" "regclass", "compress_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "compress_created_before" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_continuous_aggregate_policy"("continuous_aggregate" "regclass", "start_offset" "any", "end_offset" "any", "schedule_interval" interval, "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."add_continuous_aggregate_policy"("continuous_aggregate" "regclass", "start_offset" "any", "end_offset" "any", "schedule_interval" interval, "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_continuous_aggregate_policy"("continuous_aggregate" "regclass", "start_offset" "any", "end_offset" "any", "schedule_interval" interval, "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_continuous_aggregate_policy"("continuous_aggregate" "regclass", "start_offset" "any", "end_offset" "any", "schedule_interval" interval, "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "if_not_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "if_not_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "if_not_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "if_not_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "column_name" "name", "number_partitions" integer, "chunk_time_interval" "anyelement", "partitioning_func" "regproc", "if_not_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "column_name" "name", "number_partitions" integer, "chunk_time_interval" "anyelement", "partitioning_func" "regproc", "if_not_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "column_name" "name", "number_partitions" integer, "chunk_time_interval" "anyelement", "partitioning_func" "regproc", "if_not_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_dimension"("hypertable" "regclass", "column_name" "name", "number_partitions" integer, "chunk_time_interval" "anyelement", "partitioning_func" "regproc", "if_not_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."add_job"("proc" "regproc", "schedule_interval" interval, "config" "jsonb", "initial_start" timestamp with time zone, "scheduled" boolean, "check_config" "regproc", "fixed_schedule" boolean, "timezone" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."add_job"("proc" "regproc", "schedule_interval" interval, "config" "jsonb", "initial_start" timestamp with time zone, "scheduled" boolean, "check_config" "regproc", "fixed_schedule" boolean, "timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_job"("proc" "regproc", "schedule_interval" interval, "config" "jsonb", "initial_start" timestamp with time zone, "scheduled" boolean, "check_config" "regproc", "fixed_schedule" boolean, "timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_job"("proc" "regproc", "schedule_interval" interval, "config" "jsonb", "initial_start" timestamp with time zone, "scheduled" boolean, "check_config" "regproc", "fixed_schedule" boolean, "timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_reorder_policy"("hypertable" "regclass", "index_name" "name", "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."add_reorder_policy"("hypertable" "regclass", "index_name" "name", "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_reorder_policy"("hypertable" "regclass", "index_name" "name", "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_reorder_policy"("hypertable" "regclass", "index_name" "name", "if_not_exists" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_retention_policy"("relation" "regclass", "drop_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "drop_created_before" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."add_retention_policy"("relation" "regclass", "drop_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "drop_created_before" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."add_retention_policy"("relation" "regclass", "drop_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "drop_created_before" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_retention_policy"("relation" "regclass", "drop_after" "any", "if_not_exists" boolean, "schedule_interval" interval, "initial_start" timestamp with time zone, "timezone" "text", "drop_created_before" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."alter_job"("job_id" integer, "schedule_interval" interval, "max_runtime" interval, "max_retries" integer, "retry_period" interval, "scheduled" boolean, "config" "jsonb", "next_start" timestamp with time zone, "if_exists" boolean, "check_config" "regproc", "fixed_schedule" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."alter_job"("job_id" integer, "schedule_interval" interval, "max_runtime" interval, "max_retries" integer, "retry_period" interval, "scheduled" boolean, "config" "jsonb", "next_start" timestamp with time zone, "if_exists" boolean, "check_config" "regproc", "fixed_schedule" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."alter_job"("job_id" integer, "schedule_interval" interval, "max_runtime" interval, "max_retries" integer, "retry_period" interval, "scheduled" boolean, "config" "jsonb", "next_start" timestamp with time zone, "if_exists" boolean, "check_config" "regproc", "fixed_schedule" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."alter_job"("job_id" integer, "schedule_interval" interval, "max_runtime" interval, "max_retries" integer, "retry_period" interval, "scheduled" boolean, "config" "jsonb", "next_start" timestamp with time zone, "if_exists" boolean, "check_config" "regproc", "fixed_schedule" boolean, "initial_start" timestamp with time zone, "timezone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."approximate_row_count"("relation" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."approximate_row_count"("relation" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."approximate_row_count"("relation" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approximate_row_count"("relation" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."attach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_not_attached" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."attach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_not_attached" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."attach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_not_attached" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."attach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_not_attached" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."by_hash"("column_name" "name", "number_partitions" integer, "partition_func" "regproc") TO "postgres";
GRANT ALL ON FUNCTION "public"."by_hash"("column_name" "name", "number_partitions" integer, "partition_func" "regproc") TO "anon";
GRANT ALL ON FUNCTION "public"."by_hash"("column_name" "name", "number_partitions" integer, "partition_func" "regproc") TO "authenticated";
GRANT ALL ON FUNCTION "public"."by_hash"("column_name" "name", "number_partitions" integer, "partition_func" "regproc") TO "service_role";



GRANT ALL ON FUNCTION "public"."by_range"("column_name" "name", "partition_interval" "anyelement", "partition_func" "regproc") TO "postgres";
GRANT ALL ON FUNCTION "public"."by_range"("column_name" "name", "partition_interval" "anyelement", "partition_func" "regproc") TO "anon";
GRANT ALL ON FUNCTION "public"."by_range"("column_name" "name", "partition_interval" "anyelement", "partition_func" "regproc") TO "authenticated";
GRANT ALL ON FUNCTION "public"."by_range"("column_name" "name", "partition_interval" "anyelement", "partition_func" "regproc") TO "service_role";



GRANT ALL ON PROCEDURE "public"."cagg_migrate"(IN "cagg" "regclass", IN "override" boolean, IN "drop_old" boolean) TO "postgres";
GRANT ALL ON PROCEDURE "public"."cagg_migrate"(IN "cagg" "regclass", IN "override" boolean, IN "drop_old" boolean) TO "anon";
GRANT ALL ON PROCEDURE "public"."cagg_migrate"(IN "cagg" "regclass", IN "override" boolean, IN "drop_old" boolean) TO "authenticated";
GRANT ALL ON PROCEDURE "public"."cagg_migrate"(IN "cagg" "regclass", IN "override" boolean, IN "drop_old" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."chunk_compression_stats"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."chunk_compression_stats"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."chunk_compression_stats"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."chunk_compression_stats"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."chunks_detailed_size"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."chunks_detailed_size"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."chunks_detailed_size"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."chunks_detailed_size"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."compress_chunk"("uncompressed_chunk" "regclass", "if_not_compressed" boolean, "recompress" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."compress_chunk"("uncompressed_chunk" "regclass", "if_not_compressed" boolean, "recompress" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."compress_chunk"("uncompressed_chunk" "regclass", "if_not_compressed" boolean, "recompress" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."compress_chunk"("uncompressed_chunk" "regclass", "if_not_compressed" boolean, "recompress" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "create_default_indexes" boolean, "if_not_exists" boolean, "migrate_data" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "create_default_indexes" boolean, "if_not_exists" boolean, "migrate_data" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "create_default_indexes" boolean, "if_not_exists" boolean, "migrate_data" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "dimension" "_timescaledb_internal"."dimension_info", "create_default_indexes" boolean, "if_not_exists" boolean, "migrate_data" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "time_column_name" "name", "partitioning_column" "name", "number_partitions" integer, "associated_schema_name" "name", "associated_table_prefix" "name", "chunk_time_interval" "anyelement", "create_default_indexes" boolean, "if_not_exists" boolean, "partitioning_func" "regproc", "migrate_data" boolean, "chunk_target_size" "text", "chunk_sizing_func" "regproc", "time_partitioning_func" "regproc") TO "postgres";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "time_column_name" "name", "partitioning_column" "name", "number_partitions" integer, "associated_schema_name" "name", "associated_table_prefix" "name", "chunk_time_interval" "anyelement", "create_default_indexes" boolean, "if_not_exists" boolean, "partitioning_func" "regproc", "migrate_data" boolean, "chunk_target_size" "text", "chunk_sizing_func" "regproc", "time_partitioning_func" "regproc") TO "anon";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "time_column_name" "name", "partitioning_column" "name", "number_partitions" integer, "associated_schema_name" "name", "associated_table_prefix" "name", "chunk_time_interval" "anyelement", "create_default_indexes" boolean, "if_not_exists" boolean, "partitioning_func" "regproc", "migrate_data" boolean, "chunk_target_size" "text", "chunk_sizing_func" "regproc", "time_partitioning_func" "regproc") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_hypertable"("relation" "regclass", "time_column_name" "name", "partitioning_column" "name", "number_partitions" integer, "associated_schema_name" "name", "associated_table_prefix" "name", "chunk_time_interval" "anyelement", "create_default_indexes" boolean, "if_not_exists" boolean, "partitioning_func" "regproc", "migrate_data" boolean, "chunk_target_size" "text", "chunk_sizing_func" "regproc", "time_partitioning_func" "regproc") TO "service_role";



GRANT ALL ON FUNCTION "public"."decompress_chunk"("uncompressed_chunk" "regclass", "if_compressed" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."decompress_chunk"("uncompressed_chunk" "regclass", "if_compressed" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."decompress_chunk"("uncompressed_chunk" "regclass", "if_compressed" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."decompress_chunk"("uncompressed_chunk" "regclass", "if_compressed" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_job"("job_id" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."delete_job"("job_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_job"("job_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_job"("job_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."detach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_attached" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."detach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_attached" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."detach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_attached" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."detach_tablespace"("tablespace" "name", "hypertable" "regclass", "if_attached" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."detach_tablespaces"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."detach_tablespaces"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."detach_tablespaces"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."detach_tablespaces"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."disable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."disable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."disable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."disable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."drop_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "verbose" boolean, "created_before" "any", "created_after" "any") TO "postgres";
GRANT ALL ON FUNCTION "public"."drop_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "verbose" boolean, "created_before" "any", "created_after" "any") TO "anon";
GRANT ALL ON FUNCTION "public"."drop_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "verbose" boolean, "created_before" "any", "created_after" "any") TO "authenticated";
GRANT ALL ON FUNCTION "public"."drop_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "verbose" boolean, "created_before" "any", "created_after" "any") TO "service_role";



GRANT ALL ON FUNCTION "public"."enable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."enable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."enable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."enable_chunk_skipping"("hypertable" "regclass", "column_name" "name", "if_not_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_telemetry_report"() TO "postgres";
GRANT ALL ON FUNCTION "public"."get_telemetry_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_telemetry_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_telemetry_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_approximate_detailed_size"("relation" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_detailed_size"("relation" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_detailed_size"("relation" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_detailed_size"("relation" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_approximate_size"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_size"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_size"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_approximate_size"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_compression_stats"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_compression_stats"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_compression_stats"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_compression_stats"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_detailed_size"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_detailed_size"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_detailed_size"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_detailed_size"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_index_size"("index_name" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_index_size"("index_name" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_index_size"("index_name" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_index_size"("index_name" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."hypertable_size"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."hypertable_size"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."hypertable_size"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hypertable_size"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."interpolate"("value" real, "prev" "record", "next" "record") TO "postgres";
GRANT ALL ON FUNCTION "public"."interpolate"("value" real, "prev" "record", "next" "record") TO "anon";
GRANT ALL ON FUNCTION "public"."interpolate"("value" real, "prev" "record", "next" "record") TO "authenticated";
GRANT ALL ON FUNCTION "public"."interpolate"("value" real, "prev" "record", "next" "record") TO "service_role";



GRANT ALL ON FUNCTION "public"."interpolate"("value" double precision, "prev" "record", "next" "record") TO "postgres";
GRANT ALL ON FUNCTION "public"."interpolate"("value" double precision, "prev" "record", "next" "record") TO "anon";
GRANT ALL ON FUNCTION "public"."interpolate"("value" double precision, "prev" "record", "next" "record") TO "authenticated";
GRANT ALL ON FUNCTION "public"."interpolate"("value" double precision, "prev" "record", "next" "record") TO "service_role";



GRANT ALL ON FUNCTION "public"."interpolate"("value" smallint, "prev" "record", "next" "record") TO "postgres";
GRANT ALL ON FUNCTION "public"."interpolate"("value" smallint, "prev" "record", "next" "record") TO "anon";
GRANT ALL ON FUNCTION "public"."interpolate"("value" smallint, "prev" "record", "next" "record") TO "authenticated";
GRANT ALL ON FUNCTION "public"."interpolate"("value" smallint, "prev" "record", "next" "record") TO "service_role";



GRANT ALL ON FUNCTION "public"."interpolate"("value" integer, "prev" "record", "next" "record") TO "postgres";
GRANT ALL ON FUNCTION "public"."interpolate"("value" integer, "prev" "record", "next" "record") TO "anon";
GRANT ALL ON FUNCTION "public"."interpolate"("value" integer, "prev" "record", "next" "record") TO "authenticated";
GRANT ALL ON FUNCTION "public"."interpolate"("value" integer, "prev" "record", "next" "record") TO "service_role";



GRANT ALL ON FUNCTION "public"."interpolate"("value" bigint, "prev" "record", "next" "record") TO "postgres";
GRANT ALL ON FUNCTION "public"."interpolate"("value" bigint, "prev" "record", "next" "record") TO "anon";
GRANT ALL ON FUNCTION "public"."interpolate"("value" bigint, "prev" "record", "next" "record") TO "authenticated";
GRANT ALL ON FUNCTION "public"."interpolate"("value" bigint, "prev" "record", "next" "record") TO "service_role";



GRANT ALL ON FUNCTION "public"."locf"("value" "anyelement", "prev" "anyelement", "treat_null_as_missing" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."locf"("value" "anyelement", "prev" "anyelement", "treat_null_as_missing" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."locf"("value" "anyelement", "prev" "anyelement", "treat_null_as_missing" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."locf"("value" "anyelement", "prev" "anyelement", "treat_null_as_missing" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."move_chunk"("chunk" "regclass", "destination_tablespace" "name", "index_destination_tablespace" "name", "reorder_index" "regclass", "verbose" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."move_chunk"("chunk" "regclass", "destination_tablespace" "name", "index_destination_tablespace" "name", "reorder_index" "regclass", "verbose" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."move_chunk"("chunk" "regclass", "destination_tablespace" "name", "index_destination_tablespace" "name", "reorder_index" "regclass", "verbose" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."move_chunk"("chunk" "regclass", "destination_tablespace" "name", "index_destination_tablespace" "name", "reorder_index" "regclass", "verbose" boolean) TO "service_role";



GRANT ALL ON PROCEDURE "public"."recompress_chunk"(IN "chunk" "regclass", IN "if_not_compressed" boolean) TO "postgres";
GRANT ALL ON PROCEDURE "public"."recompress_chunk"(IN "chunk" "regclass", IN "if_not_compressed" boolean) TO "anon";
GRANT ALL ON PROCEDURE "public"."recompress_chunk"(IN "chunk" "regclass", IN "if_not_compressed" boolean) TO "authenticated";
GRANT ALL ON PROCEDURE "public"."recompress_chunk"(IN "chunk" "regclass", IN "if_not_compressed" boolean) TO "service_role";



GRANT ALL ON PROCEDURE "public"."refresh_continuous_aggregate"(IN "continuous_aggregate" "regclass", IN "window_start" "any", IN "window_end" "any") TO "postgres";
GRANT ALL ON PROCEDURE "public"."refresh_continuous_aggregate"(IN "continuous_aggregate" "regclass", IN "window_start" "any", IN "window_end" "any") TO "anon";
GRANT ALL ON PROCEDURE "public"."refresh_continuous_aggregate"(IN "continuous_aggregate" "regclass", IN "window_start" "any", IN "window_end" "any") TO "authenticated";
GRANT ALL ON PROCEDURE "public"."refresh_continuous_aggregate"(IN "continuous_aggregate" "regclass", IN "window_start" "any", IN "window_end" "any") TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_compression_policy"("hypertable" "regclass", "if_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."remove_compression_policy"("hypertable" "regclass", "if_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_compression_policy"("hypertable" "regclass", "if_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_compression_policy"("hypertable" "regclass", "if_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_continuous_aggregate_policy"("continuous_aggregate" "regclass", "if_not_exists" boolean, "if_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."remove_continuous_aggregate_policy"("continuous_aggregate" "regclass", "if_not_exists" boolean, "if_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_continuous_aggregate_policy"("continuous_aggregate" "regclass", "if_not_exists" boolean, "if_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_continuous_aggregate_policy"("continuous_aggregate" "regclass", "if_not_exists" boolean, "if_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_reorder_policy"("hypertable" "regclass", "if_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."remove_reorder_policy"("hypertable" "regclass", "if_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_reorder_policy"("hypertable" "regclass", "if_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_reorder_policy"("hypertable" "regclass", "if_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."remove_retention_policy"("relation" "regclass", "if_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."remove_retention_policy"("relation" "regclass", "if_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."remove_retention_policy"("relation" "regclass", "if_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_retention_policy"("relation" "regclass", "if_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."reorder_chunk"("chunk" "regclass", "index" "regclass", "verbose" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."reorder_chunk"("chunk" "regclass", "index" "regclass", "verbose" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_chunk"("chunk" "regclass", "index" "regclass", "verbose" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_chunk"("chunk" "regclass", "index" "regclass", "verbose" boolean) TO "service_role";



GRANT ALL ON PROCEDURE "public"."run_job"(IN "job_id" integer) TO "postgres";
GRANT ALL ON PROCEDURE "public"."run_job"(IN "job_id" integer) TO "anon";
GRANT ALL ON PROCEDURE "public"."run_job"(IN "job_id" integer) TO "authenticated";
GRANT ALL ON PROCEDURE "public"."run_job"(IN "job_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_adaptive_chunking"("hypertable" "regclass", "chunk_target_size" "text", INOUT "chunk_sizing_func" "regproc", OUT "chunk_target_size" bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_adaptive_chunking"("hypertable" "regclass", "chunk_target_size" "text", INOUT "chunk_sizing_func" "regproc", OUT "chunk_target_size" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."set_adaptive_chunking"("hypertable" "regclass", "chunk_target_size" "text", INOUT "chunk_sizing_func" "regproc", OUT "chunk_target_size" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_adaptive_chunking"("hypertable" "regclass", "chunk_target_size" "text", INOUT "chunk_sizing_func" "regproc", OUT "chunk_target_size" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_chunk_time_interval"("hypertable" "regclass", "chunk_time_interval" "anyelement", "dimension_name" "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_chunk_time_interval"("hypertable" "regclass", "chunk_time_interval" "anyelement", "dimension_name" "name") TO "anon";
GRANT ALL ON FUNCTION "public"."set_chunk_time_interval"("hypertable" "regclass", "chunk_time_interval" "anyelement", "dimension_name" "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_chunk_time_interval"("hypertable" "regclass", "chunk_time_interval" "anyelement", "dimension_name" "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_integer_now_func"("hypertable" "regclass", "integer_now_func" "regproc", "replace_if_exists" boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_integer_now_func"("hypertable" "regclass", "integer_now_func" "regproc", "replace_if_exists" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_integer_now_func"("hypertable" "regclass", "integer_now_func" "regproc", "replace_if_exists" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_integer_now_func"("hypertable" "regclass", "integer_now_func" "regproc", "replace_if_exists" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_number_partitions"("hypertable" "regclass", "number_partitions" integer, "dimension_name" "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_number_partitions"("hypertable" "regclass", "number_partitions" integer, "dimension_name" "name") TO "anon";
GRANT ALL ON FUNCTION "public"."set_number_partitions"("hypertable" "regclass", "number_partitions" integer, "dimension_name" "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_number_partitions"("hypertable" "regclass", "number_partitions" integer, "dimension_name" "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_partitioning_interval"("hypertable" "regclass", "partition_interval" "anyelement", "dimension_name" "name") TO "postgres";
GRANT ALL ON FUNCTION "public"."set_partitioning_interval"("hypertable" "regclass", "partition_interval" "anyelement", "dimension_name" "name") TO "anon";
GRANT ALL ON FUNCTION "public"."set_partitioning_interval"("hypertable" "regclass", "partition_interval" "anyelement", "dimension_name" "name") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_partitioning_interval"("hypertable" "regclass", "partition_interval" "anyelement", "dimension_name" "name") TO "service_role";



GRANT ALL ON FUNCTION "public"."show_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "created_before" "any", "created_after" "any") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "created_before" "any", "created_after" "any") TO "anon";
GRANT ALL ON FUNCTION "public"."show_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "created_before" "any", "created_after" "any") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_chunks"("relation" "regclass", "older_than" "any", "newer_than" "any", "created_before" "any", "created_after" "any") TO "service_role";



GRANT ALL ON FUNCTION "public"."show_tablespaces"("hypertable" "regclass") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_tablespaces"("hypertable" "regclass") TO "anon";
GRANT ALL ON FUNCTION "public"."show_tablespaces"("hypertable" "regclass") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_tablespaces"("hypertable" "regclass") TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date") TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint, "offset" smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint, "offset" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint, "offset" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" smallint, "ts" smallint, "offset" smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer, "offset" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer, "offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer, "offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" integer, "ts" integer, "offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint, "offset" bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint, "offset" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint, "offset" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" bigint, "ts" bigint, "offset" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "origin" "date") TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "origin" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "origin" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "origin" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "offset" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "offset" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "offset" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" "date", "offset" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "offset" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "offset" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "offset" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "offset" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "origin" timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "origin" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "origin" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp without time zone, "origin" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "offset" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "offset" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "offset" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "offset" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "origin" timestamp with time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "origin" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "origin" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "origin" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "origin" timestamp with time zone, "offset" interval) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "origin" timestamp with time zone, "offset" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "origin" timestamp with time zone, "offset" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "origin" timestamp with time zone, "offset" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" smallint, "ts" smallint, "start" smallint, "finish" smallint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" smallint, "ts" smallint, "start" smallint, "finish" smallint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" smallint, "ts" smallint, "start" smallint, "finish" smallint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" smallint, "ts" smallint, "start" smallint, "finish" smallint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" integer, "ts" integer, "start" integer, "finish" integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" integer, "ts" integer, "start" integer, "finish" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" integer, "ts" integer, "start" integer, "finish" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" integer, "ts" integer, "start" integer, "finish" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" bigint, "ts" bigint, "start" bigint, "finish" bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" bigint, "ts" bigint, "start" bigint, "finish" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" bigint, "ts" bigint, "start" bigint, "finish" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" bigint, "ts" bigint, "start" bigint, "finish" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" "date", "start" "date", "finish" "date") TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" "date", "start" "date", "finish" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" "date", "start" "date", "finish" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" "date", "start" "date", "finish" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp without time zone, "start" timestamp without time zone, "finish" timestamp without time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp without time zone, "start" timestamp without time zone, "finish" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp without time zone, "start" timestamp without time zone, "finish" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp without time zone, "start" timestamp without time zone, "finish" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "start" timestamp with time zone, "finish" timestamp with time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "start" timestamp with time zone, "finish" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "start" timestamp with time zone, "finish" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "start" timestamp with time zone, "finish" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "start" timestamp with time zone, "finish" timestamp with time zone) TO "postgres";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "start" timestamp with time zone, "finish" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "start" timestamp with time zone, "finish" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."time_bucket_gapfill"("bucket_width" interval, "ts" timestamp with time zone, "timezone" "text", "start" timestamp with time zone, "finish" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."timescaledb_post_restore"() TO "postgres";
GRANT ALL ON FUNCTION "public"."timescaledb_post_restore"() TO "anon";
GRANT ALL ON FUNCTION "public"."timescaledb_post_restore"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."timescaledb_post_restore"() TO "service_role";



GRANT ALL ON FUNCTION "public"."timescaledb_pre_restore"() TO "postgres";
GRANT ALL ON FUNCTION "public"."timescaledb_pre_restore"() TO "anon";
GRANT ALL ON FUNCTION "public"."timescaledb_pre_restore"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."timescaledb_pre_restore"() TO "service_role";



GRANT ALL ON FUNCTION "public"."first"("anyelement", "any") TO "postgres";
GRANT ALL ON FUNCTION "public"."first"("anyelement", "any") TO "anon";
GRANT ALL ON FUNCTION "public"."first"("anyelement", "any") TO "authenticated";
GRANT ALL ON FUNCTION "public"."first"("anyelement", "any") TO "service_role";



GRANT ALL ON FUNCTION "public"."histogram"(double precision, double precision, double precision, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."histogram"(double precision, double precision, double precision, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."histogram"(double precision, double precision, double precision, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."histogram"(double precision, double precision, double precision, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."last"("anyelement", "any") TO "postgres";
GRANT ALL ON FUNCTION "public"."last"("anyelement", "any") TO "anon";
GRANT ALL ON FUNCTION "public"."last"("anyelement", "any") TO "authenticated";
GRANT ALL ON FUNCTION "public"."last"("anyelement", "any") TO "service_role";
























GRANT ALL ON TABLE "public"."api_keys" TO "anon";
GRANT ALL ON TABLE "public"."api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."api_keys" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_keys_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_keys_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_keys_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."signals" TO "anon";
GRANT ALL ON TABLE "public"."signals" TO "authenticated";
GRANT ALL ON TABLE "public"."signals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."signals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."signals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."signals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."take_profits" TO "anon";
GRANT ALL ON TABLE "public"."take_profits" TO "authenticated";
GRANT ALL ON TABLE "public"."take_profits" TO "service_role";



GRANT ALL ON SEQUENCE "public"."take_profits_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."take_profits_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."take_profits_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
