-- AIインタビュー（独立版）の baseline スキーマ。
-- みらい議会（team-mirai/mirai-gikai, AGPL-3.0）のスキーマをもとに、議会関連のテーブルを除いてインタビュー中心に再構成したもの。

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

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."interview_publish_status_enum" AS ENUM (
    'draft',
    'published'
);

CREATE TYPE "public"."interview_status_enum" AS ENUM (
    'public',
    'closed'
);

ALTER TYPE "public"."interview_status_enum" OWNER TO "postgres";

CREATE TYPE "public"."interview_feedback_tag_enum" AS ENUM (
    'irrelevant_questions',
    'not_aligned',
    'misunderstood',
    'too_many_questions',
    'other'
);

ALTER TYPE "public"."interview_feedback_tag_enum" OWNER TO "postgres";

CREATE TYPE "public"."interview_mode_enum" AS ENUM (
    'loop',
    'bulk',
    'targeted'
);

ALTER TYPE "public"."interview_mode_enum" OWNER TO "postgres";

CREATE TYPE "public"."interview_report_role_enum" AS ENUM (
    'subject_expert',
    'work_related',
    'daily_life_affected',
    'general_citizen'
);

ALTER TYPE "public"."interview_report_role_enum" OWNER TO "postgres";

COMMENT ON TYPE "public"."interview_report_role_enum" IS 'インタビュー対象者の役割・属性を表すENUM型';

CREATE TYPE "public"."interview_role_enum" AS ENUM (
    'assistant',
    'user'
);

ALTER TYPE "public"."interview_role_enum" OWNER TO "postgres";

CREATE TYPE "public"."moderation_status_enum" AS ENUM (
    'ok',
    'warning',
    'ng'
);

ALTER TYPE "public"."moderation_status_enum" OWNER TO "postgres";

CREATE TYPE "public"."stance_type_enum" AS ENUM (
    'for',
    'against',
    'neutral',
    'conditional_for',
    'conditional_against',
    'considering',
    'continued_deliberation',
    'free_vote'
);

ALTER TYPE "public"."stance_type_enum" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."bulk_publish_reports"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) RETURNS bigint
    LANGUAGE "sql"
    AS $$
  with updated as (
    update interview_report r
    set is_public_by_admin = true
    from interview_sessions s
    where s.id = r.interview_session_id
      and s.interview_id = p_interview_id
      and r.is_public_by_user = true
      and r.is_public_by_admin = false
      and r.moderation_score is not null
      and r.moderation_score <= p_max_moderation_score
      and r.total_content_richness is not null
      and r.total_content_richness >= p_min_content_richness
    returning r.id
  )
  select count(*) from updated;
$$;

ALTER FUNCTION "public"."bulk_publish_reports"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."count_bulk_publish_targets"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  select count(*)
  from interview_report r
  join interview_sessions s on s.id = r.interview_session_id
  where s.interview_id = p_interview_id
    and r.is_public_by_user = true
    and r.is_public_by_admin = false
    and r.moderation_score is not null
    and r.moderation_score <= p_max_moderation_score
    and r.total_content_richness is not null
    and r.total_content_richness >= p_min_content_richness;
$$;

ALTER FUNCTION "public"."count_bulk_publish_targets"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."count_sessions_by_interview_ids"("p_interview_ids" "uuid"[]) RETURNS TABLE("interview_id" "uuid", "session_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  select
    s.interview_id,
    count(s.id) as session_count
  from interview_sessions s
  where s.interview_id = any(p_interview_ids)
  group by s.interview_id;
$$;

ALTER FUNCTION "public"."count_sessions_by_interview_ids"("p_interview_ids" "uuid"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."extract_assistant_question_id"("content" "text") RETURNS "uuid"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
  parsed JSONB;
  question_id_text TEXT;
BEGIN
  IF content IS NULL OR NOT pg_input_is_valid(content, 'jsonb') THEN
    RETURN NULL;
  END IF;

  parsed := content::jsonb;
  IF jsonb_typeof(parsed) <> 'object' THEN
    RETURN NULL;
  END IF;

  question_id_text := COALESCE(
    parsed ->> 'question_id',
    parsed ->> 'questionId'
  );
  IF question_id_text IS NULL
    OR NOT pg_input_is_valid(question_id_text, 'uuid') THEN
    RETURN NULL;
  END IF;

  RETURN question_id_text::uuid;
END;
$$;

ALTER FUNCTION "public"."extract_assistant_question_id"("content" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_sessions_ordered_by_message_count"("p_interview_id" "uuid", "p_ascending" boolean DEFAULT false, "p_offset" integer DEFAULT 0, "p_limit" integer DEFAULT 30, "p_status" "text" DEFAULT NULL::"text", "p_visibility" "text" DEFAULT NULL::"text", "p_stance" "text" DEFAULT NULL::"text", "p_role" "text" DEFAULT NULL::"text") RETURNS TABLE("session_id" "uuid")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS session_id
  FROM interview_sessions s
  LEFT JOIN (
    SELECT im.interview_session_id, COUNT(*)::BIGINT AS cnt
    FROM interview_messages im
    INNER JOIN interview_sessions iss
      ON iss.id = im.interview_session_id
    WHERE iss.interview_id = p_interview_id
    GROUP BY im.interview_session_id
  ) mc ON mc.interview_session_id = s.id
  LEFT JOIN interview_report r ON r.interview_session_id = s.id
  WHERE s.interview_id = p_interview_id
    AND (p_status IS NULL OR
         (p_status = 'completed' AND s.completed_at IS NOT NULL) OR
         (p_status = 'in_progress' AND s.completed_at IS NULL AND s.archived_at IS NULL) OR
         (p_status = 'archived' AND s.completed_at IS NULL AND s.archived_at IS NOT NULL))
    AND (p_visibility IS NULL OR
         (p_visibility = 'public' AND r.is_public_by_admin = TRUE) OR
         (p_visibility = 'private' AND r.is_public_by_admin = FALSE))
    AND (p_stance IS NULL OR r.stance = p_stance::stance_type_enum)
    AND (p_role IS NULL OR r.role = p_role::interview_report_role_enum)
  ORDER BY
    CASE WHEN p_ascending THEN COALESCE(mc.cnt, 0) END ASC,
    CASE WHEN NOT p_ascending THEN COALESCE(mc.cnt, 0) END DESC,
    s.started_at DESC,
    s.id DESC
  OFFSET p_offset
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION "public"."find_sessions_ordered_by_message_count"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_sessions_ordered_by_moderation_score"("p_interview_id" "uuid", "p_ascending" boolean DEFAULT false, "p_offset" integer DEFAULT 0, "p_limit" integer DEFAULT 30, "p_status" "text" DEFAULT NULL::"text", "p_visibility" "text" DEFAULT NULL::"text", "p_stance" "text" DEFAULT NULL::"text", "p_role" "text" DEFAULT NULL::"text") RETURNS TABLE("session_id" "uuid")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS session_id
  FROM interview_sessions s
  LEFT JOIN interview_report r
    ON r.interview_session_id = s.id
  WHERE s.interview_id = p_interview_id
    AND (p_status IS NULL OR
         (p_status = 'completed' AND s.completed_at IS NOT NULL) OR
         (p_status = 'in_progress' AND s.completed_at IS NULL AND s.archived_at IS NULL) OR
         (p_status = 'archived' AND s.completed_at IS NULL AND s.archived_at IS NOT NULL))
    AND (p_visibility IS NULL OR
         (p_visibility = 'public' AND r.is_public_by_admin = TRUE) OR
         (p_visibility = 'private' AND r.is_public_by_admin = FALSE))
    AND (p_stance IS NULL OR r.stance = p_stance::stance_type_enum)
    AND (p_role IS NULL OR r.role = p_role::interview_report_role_enum)
  ORDER BY
    CASE WHEN p_ascending THEN r.moderation_score END ASC NULLS LAST,
    CASE WHEN NOT p_ascending THEN r.moderation_score END DESC NULLS LAST,
    s.started_at DESC,
    s.id DESC
  OFFSET p_offset
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION "public"."find_sessions_ordered_by_moderation_score"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."find_sessions_ordered_by_total_content_richness"("p_interview_id" "uuid", "p_ascending" boolean DEFAULT false, "p_offset" integer DEFAULT 0, "p_limit" integer DEFAULT 30, "p_status" "text" DEFAULT NULL::"text", "p_visibility" "text" DEFAULT NULL::"text", "p_stance" "text" DEFAULT NULL::"text", "p_role" "text" DEFAULT NULL::"text") RETURNS TABLE("session_id" "uuid")
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT s.id AS session_id
  FROM interview_sessions s
  LEFT JOIN interview_report r
    ON r.interview_session_id = s.id
  WHERE s.interview_id = p_interview_id
    AND (p_status IS NULL OR
         (p_status = 'completed' AND s.completed_at IS NOT NULL) OR
         (p_status = 'in_progress' AND s.completed_at IS NULL AND s.archived_at IS NULL) OR
         (p_status = 'archived' AND s.completed_at IS NULL AND s.archived_at IS NOT NULL))
    AND (p_visibility IS NULL OR
         (p_visibility = 'public' AND r.is_public_by_admin = TRUE) OR
         (p_visibility = 'private' AND r.is_public_by_admin = FALSE))
    AND (p_stance IS NULL OR r.stance = p_stance::stance_type_enum)
    AND (p_role IS NULL OR r.role = p_role::interview_report_role_enum)
  ORDER BY
    CASE WHEN p_ascending THEN r.total_content_richness END ASC NULLS LAST,
    CASE WHEN NOT p_ascending THEN r.total_content_richness END DESC NULLS LAST,
    s.started_at DESC,
    s.id DESC
  OFFSET p_offset
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION "public"."find_sessions_ordered_by_total_content_richness"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_admin_users"() RETURNS TABLE("id" "uuid", "email" "text", "created_at" timestamp with time zone, "last_sign_in_at" timestamp with time zone)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  SELECT u.id, u.email, u.created_at, u.last_sign_in_at
  FROM auth.users u
  WHERE u.raw_app_meta_data->'roles' ? 'admin'
  ORDER BY u.created_at DESC;
$$;

ALTER FUNCTION "public"."get_admin_users"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_chat_usage_metrics"("p_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_to" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_interview_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("prompt_name" "text", "event_count" bigint, "unique_user_count" bigint, "unique_session_count" bigint, "total_tokens" bigint, "total_cost_usd" numeric)
    LANGUAGE "sql" STABLE
    AS $$
  select
    coalesce(e.prompt_name, '(unknown)') as prompt_name,
    count(*) as event_count,
    count(distinct e.user_id) as unique_user_count,
    count(distinct e.session_id) as unique_session_count,
    coalesce(sum(e.total_tokens), 0)::bigint as total_tokens,
    coalesce(sum(e.cost_usd), 0) as total_cost_usd
  from public.chat_usage_events e
  where (p_from is null or e.occurred_at >= p_from)
    and (p_to is null or e.occurred_at < p_to)
    and (p_interview_id is null or e.metadata ->> 'interviewId' = p_interview_id::text)
  group by 1
  order by event_count desc;
$$;

ALTER FUNCTION "public"."get_chat_usage_metrics"("p_from" timestamp with time zone, "p_to" timestamp with time zone, "p_interview_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_interview_message_counts"("session_ids" "uuid"[]) RETURNS TABLE("interview_session_id" "uuid", "message_count" bigint)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    im.interview_session_id,
    COUNT(*)::BIGINT AS message_count
  FROM interview_messages im
  WHERE im.interview_session_id = ANY(session_ids)
  GROUP BY im.interview_session_id;
END;
$$;

ALTER FUNCTION "public"."get_interview_message_counts"("session_ids" "uuid"[]) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_interview_statistics"("p_interview_id" "uuid") RETURNS TABLE("total_sessions" bigint, "completed_sessions" bigint, "avg_rating" numeric, "stance_for_count" bigint, "stance_against_count" bigint, "stance_neutral_count" bigint, "avg_total_content_richness" numeric, "role_subject_expert_count" bigint, "role_work_related_count" bigint, "role_daily_life_affected_count" bigint, "role_general_citizen_count" bigint, "avg_message_count" numeric, "median_duration_seconds" numeric, "total_duration_seconds" numeric, "total_duration_seconds_under_1h" numeric, "public_by_user_count" bigint, "feedback_irrelevant_questions" bigint, "feedback_not_aligned" bigint, "feedback_misunderstood" bigint, "feedback_too_many_questions" bigint, "feedback_other" bigint, "total_cost_usd" numeric, "avg_cost_usd" numeric)
    LANGUAGE "plpgsql" STABLE
    AS $$
begin
  return query
  select
    count(s.id) as total_sessions,
    count(s.completed_at) as completed_sessions,
    round(avg(s.rating)::numeric, 2) as avg_rating,
    count(case when r.stance = 'for' then 1 end) as stance_for_count,
    count(case when r.stance = 'against' then 1 end) as stance_against_count,
    count(case when r.stance = 'neutral' then 1 end) as stance_neutral_count,
    round(avg(r.total_content_richness)::numeric, 1) as avg_total_content_richness,
    count(case when r.role = 'subject_expert' then 1 end) as role_subject_expert_count,
    count(case when r.role = 'work_related' then 1 end) as role_work_related_count,
    count(case when r.role = 'daily_life_affected' then 1 end) as role_daily_life_affected_count,
    count(case when r.role = 'general_citizen' then 1 end) as role_general_citizen_count,
    round(avg(coalesce(mc.message_count, 0))::numeric, 1) as avg_message_count,
    round(
      (select percentile_cont(0.5) within group (
        order by extract(epoch from (sub.completed_at - sub.started_at))
      )
      from interview_sessions sub
      where sub.interview_id = p_interview_id
        and sub.completed_at is not null
      )::numeric, 0
    ) as median_duration_seconds,
    -- 総所要時間: 完了セッションは completed_at、途中離脱は最終メッセージ時刻を終了時刻として集計
    -- メッセージが無い未完了セッションは duration を算出できないため除外
    coalesce(max(dur.total_seconds), 0)::numeric as total_duration_seconds,
    -- 1時間以上のセッションを除外した総所要時間
    coalesce(max(dur.total_seconds_under_1h), 0)::numeric as total_duration_seconds_under_1h,
    count(case when r.is_public_by_user = true then 1 end) as public_by_user_count,
    -- フィードバックタグ集計
    coalesce(max(fc.feedback_irrelevant_questions), 0) as feedback_irrelevant_questions,
    coalesce(max(fc.feedback_not_aligned), 0) as feedback_not_aligned,
    coalesce(max(fc.feedback_misunderstood), 0) as feedback_misunderstood,
    coalesce(max(fc.feedback_too_many_questions), 0) as feedback_too_many_questions,
    coalesce(max(fc.feedback_other), 0) as feedback_other,
    -- コスト集計
    coalesce(max(cc.total_cost), 0)::numeric as total_cost_usd,
    case
      when count(s.id) > 0 then round(coalesce(max(cc.total_cost), 0)::numeric / count(s.id), 6)
      else 0::numeric
    end as avg_cost_usd
  from interview_sessions s
  left join interview_report r on r.interview_session_id = s.id
  left join (
    select im.interview_session_id, count(*) as message_count
    from interview_messages im
    group by im.interview_session_id
  ) mc on mc.interview_session_id = s.id
  left join (
    select
      sum(d.seconds) as total_seconds,
      sum(d.seconds) filter (where d.seconds < 3600) as total_seconds_under_1h
    from (
      select extract(epoch from (
        coalesce(sub.completed_at, lm.last_message_at) - sub.started_at
      )) as seconds
      from interview_sessions sub
      left join (
        select im.interview_session_id, max(im.created_at) as last_message_at
        from interview_messages im
        group by im.interview_session_id
      ) lm on lm.interview_session_id = sub.id
      where sub.interview_id = p_interview_id
        and coalesce(sub.completed_at, lm.last_message_at) is not null
    ) d
  ) dur on true
  left join (
    select
      count(*) filter (where f.tag = 'irrelevant_questions') as feedback_irrelevant_questions,
      count(*) filter (where f.tag = 'not_aligned') as feedback_not_aligned,
      count(*) filter (where f.tag = 'misunderstood') as feedback_misunderstood,
      count(*) filter (where f.tag = 'too_many_questions') as feedback_too_many_questions,
      count(*) filter (where f.tag = 'other') as feedback_other
    from interview_rating_feedbacks f
    join interview_sessions fs on fs.id = f.interview_session_id
    where fs.interview_id = p_interview_id
  ) fc on true
  left join (
    select sum(c.cost_usd) as total_cost
    from chat_usage_events c
    join interview_sessions cs on cs.id::text = c.session_id
    where cs.interview_id = p_interview_id
  ) cc on true
  where s.interview_id = p_interview_id;
end;
$$;

ALTER FUNCTION "public"."get_interview_statistics"("p_interview_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_question_answer_counts"("p_interview_id" "uuid") RETURNS TABLE("question_id" "uuid", "question" "text", "question_order" integer, "asked_session_count" bigint, "answered_session_count" bigint)
    LANGUAGE "plpgsql" STABLE
    AS $$
BEGIN
  RETURN QUERY
  WITH asked AS (
    SELECT t.session_id, t.created_at, t.qid
    FROM (
      SELECT
        m.interview_session_id AS session_id,
        m.created_at,
        extract_assistant_question_id(m.content) AS qid
      FROM interview_messages m
      JOIN interview_sessions s ON s.id = m.interview_session_id
      WHERE s.interview_id = p_interview_id
        AND m.role = 'assistant'
    ) t
    WHERE t.qid IS NOT NULL
  ),
  last_user_message AS (
    SELECT
      m.interview_session_id AS session_id,
      MAX(m.created_at) AS last_user_at
    FROM interview_messages m
    JOIN interview_sessions s ON s.id = m.interview_session_id
    WHERE s.interview_id = p_interview_id
      AND m.role = 'user'
    GROUP BY m.interview_session_id
  )
  SELECT
    q.id AS question_id,
    q.question,
    q.question_order,
    COUNT(DISTINCT a.session_id) AS asked_session_count,
    COUNT(DISTINCT a.session_id) FILTER (WHERE lu.last_user_at > a.created_at)
      AS answered_session_count
  FROM interview_questions q
  LEFT JOIN asked a ON a.qid = q.id
  LEFT JOIN last_user_message lu ON lu.session_id = a.session_id
  WHERE q.interview_id = p_interview_id
  GROUP BY q.id, q.question, q.question_order
  ORDER BY q.question_order;
END;
$$;

ALTER FUNCTION "public"."get_question_answer_counts"("p_interview_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."increment_api_rate_limit"("p_key" "text", "p_window_start" timestamp with time zone, "p_limit" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO api_rate_limits (key, window_start, request_count)
  VALUES (p_key, p_window_start, 1)
  ON CONFLICT (key, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  -- 過去ウィンドウを掃除（テーブル肥大を防ぐ）。
  -- 新しいウィンドウ行を作った最初の呼び出しのみ実行し、同一ウィンドウ内の
  -- 残り N-1 回の呼び出しで無駄な索引スキャンを繰り返さない
  IF v_count = 1 THEN
    -- 同一キーの過去ウィンドウ
    DELETE FROM api_rate_limits
    WHERE key = p_key AND window_start < p_window_start;
    -- 二度と現れないキー（IPローテーション等）の行が永久に残らないよう、
    -- 全キー横断で1時間より古いウィンドウも併せて掃除する
    DELETE FROM api_rate_limits
    WHERE window_start < p_window_start - INTERVAL '1 hour';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

ALTER FUNCTION "public"."increment_api_rate_limit"("p_key" "text", "p_window_start" timestamp with time zone, "p_limit" integer) OWNER TO "postgres";

COMMENT ON FUNCTION "public"."increment_api_rate_limit"("p_key" "text", "p_window_start" timestamp with time zone, "p_limit" integer) IS 'レートリミットカウンタを加算し、制限内なら true を返す（超過時 false）。ウィンドウ開始時刻はアプリ側で切り捨て計算して渡す';

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_app_meta_data->>'roles' LIKE '%admin%'
    )
  );
END;
$$;

ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."sum_chat_usage_cost"("from_iso" timestamp with time zone, "to_iso" timestamp with time zone) RETURNS numeric
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(sum(cost_usd), 0)
  from public.chat_usage_events
  where occurred_at >= from_iso
    and occurred_at < to_iso;
$$;

ALTER FUNCTION "public"."sum_chat_usage_cost"("from_iso" timestamp with time zone, "to_iso" timestamp with time zone) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."unpublish_reports_by_interview_id"("p_interview_id" "uuid") RETURNS "void"
    LANGUAGE "sql"
    AS $$
  update interview_report r
  set is_public_by_admin = false,
      admin_unpublished_at = now()
  from interview_sessions s
  where r.interview_session_id = s.id
    and s.interview_id = p_interview_id
    and (r.is_public_by_admin = true or r.admin_unpublished_at is null);
$$;

ALTER FUNCTION "public"."unpublish_reports_by_interview_id"("p_interview_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."api_rate_limits" (
    "key" "text" NOT NULL,
    "window_start" timestamp with time zone NOT NULL,
    "request_count" integer DEFAULT 0 NOT NULL
);

ALTER TABLE "public"."api_rate_limits" OWNER TO "postgres";

COMMENT ON TABLE "public"."api_rate_limits" IS '公開APIのレートリミットカウンタ（固定ウィンドウ）。keyは "ip:<addr>" や "global" 等の制限単位';

CREATE TABLE IF NOT EXISTS "public"."chat_usage_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text",
    "prompt_name" "text",
    "model" "text" NOT NULL,
    "input_tokens" integer DEFAULT 0 NOT NULL,
    "output_tokens" integer DEFAULT 0 NOT NULL,
    "total_tokens" integer DEFAULT 0 NOT NULL,
    "cost_usd" numeric(12,6) DEFAULT 0 NOT NULL,
    "metadata" "jsonb",
    "occurred_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."chat_usage_events" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."interviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "summary" "text",
    "description" "text",
    "background" "text",
    "thumbnail_url" "text",
    "publish_status" "public"."interview_publish_status_enum" DEFAULT 'draft'::"public"."interview_publish_status_enum" NOT NULL,
    "status" "public"."interview_status_enum" DEFAULT 'closed'::"public"."interview_status_enum" NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "featured_order" integer DEFAULT 0 NOT NULL,
    "closes_at" timestamp with time zone,
    "published_at" timestamp with time zone,
    "show_prompt" boolean DEFAULT true NOT NULL,
    "themes" "text"[],
    "mode" "public"."interview_mode_enum" DEFAULT 'loop'::"public"."interview_mode_enum" NOT NULL,
    "chat_model" "text" DEFAULT 'openai/gpt-5-mini'::"text",
    "estimated_duration" integer,
    "prompt_overrides" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "interviews_slug_format" CHECK (("slug" ~ '^[a-z0-9][a-z0-9-]*$'::"text"))
);

ALTER TABLE "public"."interviews" OWNER TO "postgres";

COMMENT ON TABLE "public"."interviews" IS '議案ごとのインタビュー設定を管理するテーブル';

COMMENT ON COLUMN "public"."interviews"."status" IS '設定ステータス（public: 公開/有効, closed: 非公開/無効）';

COMMENT ON COLUMN "public"."interviews"."themes" IS 'テーマの配列';

COMMENT ON COLUMN "public"."interviews"."name" IS '設定名（識別用）';

COMMENT ON COLUMN "public"."interviews"."mode" IS 'インタビューモード: loop（逐次深掘り）または bulk（一括深掘り）';

COMMENT ON COLUMN "public"."interviews"."prompt_overrides" IS 'インタビュープロンプトの節ごとの上書き。キーは PROMPT_SECTION_KEYS（responsibilities / cautions / expertiseDetection / deepDiveTechniques / stopCriteria / questionUsageRules）。未設定の節はコード側の既定値を使う。';

CREATE TABLE IF NOT EXISTS "public"."interview_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_session_id" "uuid" NOT NULL,
    "role" "public"."interview_role_enum" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."interview_messages" OWNER TO "postgres";

COMMENT ON TABLE "public"."interview_messages" IS 'インタビュー内の質問と回答を保存するテーブル';

COMMENT ON COLUMN "public"."interview_messages"."interview_session_id" IS 'インタビューセッションID';

COMMENT ON COLUMN "public"."interview_messages"."role" IS 'メッセージの役割（assistant: AIからの質問, user: ユーザーからの回答）';

COMMENT ON COLUMN "public"."interview_messages"."content" IS 'メッセージ内容';

CREATE TABLE IF NOT EXISTS "public"."interview_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "follow_up_guide" "text",
    "quick_replies" "text"[],
    "question_order" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "target_audience" "text"
);

ALTER TABLE "public"."interview_questions" OWNER TO "postgres";

COMMENT ON TABLE "public"."interview_questions" IS '事前定義されたインタビュー質問を管理するテーブル';

COMMENT ON COLUMN "public"."interview_questions"."interview_id" IS 'インタビュー設定ID';

COMMENT ON COLUMN "public"."interview_questions"."question" IS '質問文';

COMMENT ON COLUMN "public"."interview_questions"."follow_up_guide" IS '回答後のフォローアップ指針（深掘り方法など）';

COMMENT ON COLUMN "public"."interview_questions"."quick_replies" IS 'ユーザーが選択できるクイックリプライ';

COMMENT ON COLUMN "public"."interview_questions"."question_order" IS '質問の順序';

COMMENT ON COLUMN "public"."interview_questions"."target_audience" IS '対象者条件（任意）。指定された場合、LLMが会話文脈からインタビュイーの該当性を判定し、非該当なら質問をスキップする。targetedモードでのみ利用される。';

CREATE TABLE IF NOT EXISTS "public"."interview_rating_feedbacks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_session_id" "uuid" NOT NULL,
    "tag" "public"."interview_feedback_tag_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."interview_rating_feedbacks" OWNER TO "postgres";

COMMENT ON TABLE "public"."interview_rating_feedbacks" IS '低評価（3以下）時のフィードバックタグ';

COMMENT ON COLUMN "public"."interview_rating_feedbacks"."tag" IS 'フィードバックタグ種別';

CREATE TABLE IF NOT EXISTS "public"."interview_report" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_session_id" "uuid" NOT NULL,
    "summary" "text",
    "stance" "public"."stance_type_enum",
    "role" "public"."interview_report_role_enum",
    "role_description" "text",
    "opinions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_public_by_admin" boolean DEFAULT false NOT NULL,
    "content_richness" "jsonb",
    "role_title" "text",
    "is_public_by_user" boolean DEFAULT false NOT NULL,
    "total_content_richness" integer GENERATED ALWAYS AS (
CASE
    WHEN (("content_richness" IS NOT NULL) AND (("content_richness" ->> 'total'::"text") IS NOT NULL) AND (("content_richness" ->> 'total'::"text") ~ '^\d+$'::"text")) THEN (("content_richness" ->> 'total'::"text"))::integer
    ELSE NULL::integer
END) STORED,
    "moderation_score" integer,
    "moderation_status" "public"."moderation_status_enum" GENERATED ALWAYS AS (
CASE
    WHEN ("moderation_score" IS NULL) THEN NULL::"public"."moderation_status_enum"
    WHEN ("moderation_score" >= 70) THEN 'ng'::"public"."moderation_status_enum"
    WHEN ("moderation_score" >= 30) THEN 'warning'::"public"."moderation_status_enum"
    ELSE 'ok'::"public"."moderation_status_enum"
END) STORED,
    "moderation_reasoning" "text",
    "opinions_reextracted_at" timestamp with time zone,
    "is_data_reuse_consented" boolean DEFAULT false NOT NULL,
    "admin_unpublished_at" timestamp with time zone,
    CONSTRAINT "chk_moderation_score_range" CHECK ((("moderation_score" IS NULL) OR (("moderation_score" >= 0) AND ("moderation_score" <= 100))))
);

ALTER TABLE "public"."interview_report" OWNER TO "postgres";

COMMENT ON TABLE "public"."interview_report" IS 'インタビュー結果のレポートを保存するテーブル（AIが自動生成）';

COMMENT ON COLUMN "public"."interview_report"."interview_session_id" IS 'インタビューセッションID（1セッション1レポート）';

COMMENT ON COLUMN "public"."interview_report"."summary" IS 'インタビュー要約';

COMMENT ON COLUMN "public"."interview_report"."stance" IS 'AIが分析したユーザーのスタンス';

COMMENT ON COLUMN "public"."interview_report"."role" IS 'AIが推論したユーザーの役割・属性（ENUM型）';

COMMENT ON COLUMN "public"."interview_report"."role_description" IS '役割の説明';

COMMENT ON COLUMN "public"."interview_report"."opinions" IS '意見の配列 [{title: string, content: string}, ...]';

COMMENT ON COLUMN "public"."interview_report"."is_public_by_admin" IS '管理者によるレポートの公開状態（true: 公開, false: 非公開）';

COMMENT ON COLUMN "public"."interview_report"."content_richness" IS 'インタビューの情報充実度評価（total, clarity, specificity, impact, constructiveness, reasoning）';

COMMENT ON COLUMN "public"."interview_report"."role_title" IS 'A short title (10 characters or less) summarizing the user role, e.g., "物流業者", "主婦"';

COMMENT ON COLUMN "public"."interview_report"."is_public_by_user" IS 'Whether the user has consented to making their interview report public';

COMMENT ON COLUMN "public"."interview_report"."total_content_richness" IS '総合的な情報充実度（0-100）- content_richnessから自動生成されるGenerated Column';

COMMENT ON COLUMN "public"."interview_report"."moderation_score" IS 'モデレーションスコア（0-100）: 0が最も適切、100が最も不適切';

COMMENT ON COLUMN "public"."interview_report"."moderation_status" IS 'モデレーションステータス（generated column）: ok=問題なし, warning=要注意, ng=不適切';

COMMENT ON COLUMN "public"."interview_report"."moderation_reasoning" IS 'モデレーションスコアの根拠（200文字以内）';

COMMENT ON COLUMN "public"."interview_report"."opinions_reextracted_at" IS '意見再抽出バックフィルの完了時刻（NULL=未処理）';

COMMENT ON COLUMN "public"."interview_report"."is_data_reuse_consented" IS 'ユーザーがデータの二次利用（オープンデータとしての第三者提供）に同意したか（新利用規約を確認した上での同意のみ true）';

COMMENT ON COLUMN "public"."interview_report"."admin_unpublished_at" IS '管理者がレポートを非公開にした時刻（NULL=管理者による非公開操作なし）。NULL でない場合はユーザー操作による自動公開の対象外';

CREATE TABLE IF NOT EXISTS "public"."interview_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "langfuse_session_id" "text",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone,
    "rating" smallint,
    CONSTRAINT "interview_sessions_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);

ALTER TABLE "public"."interview_sessions" OWNER TO "postgres";

COMMENT ON TABLE "public"."interview_sessions" IS 'インタビューセッションを管理するテーブル';

COMMENT ON COLUMN "public"."interview_sessions"."interview_id" IS 'インタビュー設定ID';

COMMENT ON COLUMN "public"."interview_sessions"."user_id" IS 'ユーザーID（匿名認証）';

COMMENT ON COLUMN "public"."interview_sessions"."langfuse_session_id" IS 'LangfuseセッションID';

COMMENT ON COLUMN "public"."interview_sessions"."started_at" IS '開始日時';

COMMENT ON COLUMN "public"."interview_sessions"."completed_at" IS '完了日時';

CREATE TABLE IF NOT EXISTS "public"."preview_tokens" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "interview_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text"
);

ALTER TABLE "public"."preview_tokens" OWNER TO "postgres";

COMMENT ON TABLE "public"."preview_tokens" IS '公開前インタビューのプレビュー用トークン';

COMMENT ON COLUMN "public"."preview_tokens"."token" IS 'Unique preview access token';

COMMENT ON COLUMN "public"."preview_tokens"."expires_at" IS 'Token expiration date (30 days)';

ALTER TABLE ONLY "public"."api_rate_limits"
    ADD CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("key", "window_start");

ALTER TABLE ONLY "public"."chat_usage_events"
    ADD CONSTRAINT "chat_usage_events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interviews"
    ADD CONSTRAINT "interviews_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interview_messages"
    ADD CONSTRAINT "interview_messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interview_rating_feedbacks"
    ADD CONSTRAINT "interview_rating_feedbacks_interview_session_id_tag_key" UNIQUE ("interview_session_id", "tag");

ALTER TABLE ONLY "public"."interview_rating_feedbacks"
    ADD CONSTRAINT "interview_rating_feedbacks_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interview_report"
    ADD CONSTRAINT "interview_report_interview_session_id_key" UNIQUE ("interview_session_id");

ALTER TABLE ONLY "public"."interview_report"
    ADD CONSTRAINT "interview_report_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."preview_tokens"
    ADD CONSTRAINT "preview_tokens_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."preview_tokens"
    ADD CONSTRAINT "preview_tokens_token_key" UNIQUE ("token");

CREATE INDEX "chat_usage_events_session_id_idx" ON "public"."chat_usage_events" USING "btree" ("session_id");

CREATE INDEX "chat_usage_events_user_id_occurred_at_idx" ON "public"."chat_usage_events" USING "btree" ("user_id", "occurred_at");

CREATE INDEX "idx_api_rate_limits_window_start" ON "public"."api_rate_limits" USING "btree" ("window_start");

CREATE INDEX "idx_interviews_status" ON "public"."interviews" USING "btree" ("status");

CREATE INDEX "idx_interview_messages_session_created" ON "public"."interview_messages" USING "btree" ("interview_session_id", "created_at");

CREATE INDEX "idx_interview_messages_session_id" ON "public"."interview_messages" USING "btree" ("interview_session_id");

CREATE INDEX "idx_interview_questions_interview_id" ON "public"."interview_questions" USING "btree" ("interview_id");

CREATE INDEX "idx_interview_questions_interview_order" ON "public"."interview_questions" USING "btree" ("interview_id", "question_order");

CREATE INDEX "idx_interview_rating_feedbacks_session" ON "public"."interview_rating_feedbacks" USING "btree" ("interview_session_id");

CREATE INDEX "idx_interview_rating_feedbacks_tag" ON "public"."interview_rating_feedbacks" USING "btree" ("tag");

CREATE INDEX "idx_interview_report_data_reuse_public" ON "public"."interview_report" USING "btree" ("created_at" DESC, "id" DESC) WHERE ("is_public_by_admin" AND "is_public_by_user" AND "is_data_reuse_consented");

CREATE INDEX "idx_interview_report_is_public_by_admin" ON "public"."interview_report" USING "btree" ("is_public_by_admin");

CREATE INDEX "idx_interview_report_moderation_status" ON "public"."interview_report" USING "btree" ("moderation_status");

CREATE INDEX "idx_interview_report_public_session" ON "public"."interview_report" USING "btree" ("interview_session_id") WHERE ("is_public_by_admin" AND "is_public_by_user");

CREATE INDEX "idx_interview_report_total_content_richness" ON "public"."interview_report" USING "btree" ("total_content_richness" DESC NULLS LAST);

CREATE INDEX "idx_interview_sessions_interview_id" ON "public"."interview_sessions" USING "btree" ("interview_id");

CREATE INDEX "idx_interview_sessions_interview_user" ON "public"."interview_sessions" USING "btree" ("interview_id", "user_id");

CREATE INDEX "idx_interview_sessions_started_at" ON "public"."interview_sessions" USING "btree" ("started_at");

CREATE INDEX "idx_interview_sessions_user_id" ON "public"."interview_sessions" USING "btree" ("user_id");

CREATE INDEX "idx_preview_tokens_expires_at" ON "public"."preview_tokens" USING "btree" ("expires_at");

CREATE INDEX "idx_preview_tokens_token" ON "public"."preview_tokens" USING "btree" ("token");

CREATE OR REPLACE TRIGGER "update_interviews_updated_at" BEFORE UPDATE ON "public"."interviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_interview_questions_updated_at" BEFORE UPDATE ON "public"."interview_questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_interview_report_updated_at" BEFORE UPDATE ON "public"."interview_report" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "update_interview_sessions_updated_at" BEFORE UPDATE ON "public"."interview_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

ALTER TABLE ONLY "public"."interview_messages"
    ADD CONSTRAINT "interview_messages_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."interview_rating_feedbacks"
    ADD CONSTRAINT "interview_rating_feedbacks_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."interview_report"
    ADD CONSTRAINT "interview_report_interview_session_id_fkey" FOREIGN KEY ("interview_session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;

ALTER TABLE "public"."api_rate_limits" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."chat_usage_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interviews" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interview_messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interview_questions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interview_rating_feedbacks" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interview_report" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."interview_sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."preview_tokens" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

REVOKE ALL ON FUNCTION "public"."bulk_publish_reports"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."bulk_publish_reports"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."count_bulk_publish_targets"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."count_bulk_publish_targets"("p_interview_id" "uuid", "p_max_moderation_score" integer, "p_min_content_richness" integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."count_sessions_by_interview_ids"("p_interview_ids" "uuid"[]) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."count_sessions_by_interview_ids"("p_interview_ids" "uuid"[]) TO "service_role";

REVOKE ALL ON FUNCTION "public"."extract_assistant_question_id"("content" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."extract_assistant_question_id"("content" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."find_sessions_ordered_by_message_count"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."find_sessions_ordered_by_message_count"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."find_sessions_ordered_by_moderation_score"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."find_sessions_ordered_by_moderation_score"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."find_sessions_ordered_by_total_content_richness"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."find_sessions_ordered_by_total_content_richness"("p_interview_id" "uuid", "p_ascending" boolean, "p_offset" integer, "p_limit" integer, "p_status" "text", "p_visibility" "text", "p_stance" "text", "p_role" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_admin_users"() FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."get_admin_users"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_chat_usage_metrics"("p_from" timestamp with time zone, "p_to" timestamp with time zone, "p_interview_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."get_chat_usage_metrics"("p_from" timestamp with time zone, "p_to" timestamp with time zone, "p_interview_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_interview_message_counts"("session_ids" "uuid"[]) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."get_interview_message_counts"("session_ids" "uuid"[]) TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_interview_statistics"("p_interview_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."get_interview_statistics"("p_interview_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."get_question_answer_counts"("p_interview_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."get_question_answer_counts"("p_interview_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."increment_api_rate_limit"("p_key" "text", "p_window_start" timestamp with time zone, "p_limit" integer) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."increment_api_rate_limit"("p_key" "text", "p_window_start" timestamp with time zone, "p_limit" integer) TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";

GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";

REVOKE ALL ON FUNCTION "public"."sum_chat_usage_cost"("from_iso" timestamp with time zone, "to_iso" timestamp with time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."sum_chat_usage_cost"("from_iso" timestamp with time zone, "to_iso" timestamp with time zone) TO "service_role";

REVOKE ALL ON FUNCTION "public"."unpublish_reports_by_interview_id"("p_interview_id" "uuid") FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."unpublish_reports_by_interview_id"("p_interview_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."update_updated_at_column"() FROM PUBLIC;

GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";

GRANT ALL ON TABLE "public"."api_rate_limits" TO "service_role";

GRANT ALL ON TABLE "public"."chat_usage_events" TO "service_role";

GRANT ALL ON TABLE "public"."interviews" TO "service_role";

GRANT ALL ON TABLE "public"."interview_messages" TO "service_role";

GRANT ALL ON TABLE "public"."interview_questions" TO "service_role";

GRANT ALL ON TABLE "public"."interview_rating_feedbacks" TO "service_role";

GRANT ALL ON TABLE "public"."interview_report" TO "service_role";

GRANT ALL ON TABLE "public"."interview_sessions" TO "service_role";

GRANT ALL ON TABLE "public"."preview_tokens" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

-- インタビュー一覧・FK・インデックス
CREATE UNIQUE INDEX "idx_interviews_slug" ON "public"."interviews" USING "btree" ("slug");
CREATE INDEX "idx_interviews_listing" ON "public"."interviews" USING "btree" ("publish_status", "is_featured", "featured_order", "created_at" DESC) WHERE ("deleted_at" IS NULL);
CREATE INDEX "idx_preview_tokens_interview_id" ON "public"."preview_tokens" USING "btree" ("interview_id");
ALTER TABLE ONLY "public"."preview_tokens"
    ADD CONSTRAINT "preview_tokens_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION "public"."count_public_reports_by_interview_ids"("p_interview_ids" "uuid"[]) RETURNS TABLE("interview_id" "uuid", "report_count" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select s.interview_id, count(*) as report_count
  from interview_report r
  join interview_sessions s on s.id = r.interview_session_id
  where s.interview_id = any(p_interview_ids)
    and r.is_public_by_admin
    and r.is_public_by_user
  group by s.interview_id;
$$;
COMMENT ON FUNCTION "public"."count_public_reports_by_interview_ids"("p_interview_ids" "uuid"[]) IS 'インタビューごとの公開された会話の件数（管理者公開 × ユーザー公開）。一覧の「N件の声」用。';
REVOKE ALL ON FUNCTION "public"."count_public_reports_by_interview_ids"("p_interview_ids" "uuid"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."count_public_reports_by_interview_ids"("p_interview_ids" "uuid"[]) TO "service_role";

CREATE OR REPLACE FUNCTION "public"."get_interview_metrics"("p_interview_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("interview_id" "uuid", "interview_name" "text", "conducted_count" bigint, "completed_count" bigint, "public_count" bigint, "completion_rate" numeric, "total_duration_seconds" numeric, "total_duration_seconds_under_1h" numeric)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public'
    AS $$
  select
    i.id as interview_id,
    i.name as interview_name,
    count(s.id) as conducted_count,
    count(s.completed_at) as completed_count,
    count(r.id) filter (where r.is_public_by_admin and r.is_public_by_user) as public_count,
    case when count(s.id) = 0 then 0
      else round(count(s.completed_at)::numeric / count(s.id)::numeric, 3) end as completion_rate,
    round(coalesce(sum(d.seconds), 0)::numeric, 0) as total_duration_seconds,
    round(coalesce(sum(d.seconds) filter (where d.seconds < 3600), 0)::numeric, 0) as total_duration_seconds_under_1h
  from interviews i
  left join interview_sessions s on s.interview_id = i.id
  left join interview_report r on r.interview_session_id = s.id
  left join (
    select im.interview_session_id, max(im.created_at) as last_message_at
    from interview_messages im group by im.interview_session_id
  ) lm on lm.interview_session_id = s.id
  left join lateral (
    select extract(epoch from (coalesce(s.completed_at, lm.last_message_at) - s.started_at)) as seconds
  ) d on true
  where i.deleted_at is null and (p_interview_id is null or i.id = p_interview_id)
  group by i.id, i.name
  order by count(s.id) desc, i.name;
$$;
COMMENT ON FUNCTION "public"."get_interview_metrics"("p_interview_id" "uuid") IS 'インタビューごとの回答者数・最後まで回答した数・公開された会話の数・完了率・総回答時間を集計する。';
REVOKE ALL ON FUNCTION "public"."get_interview_metrics"("p_interview_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_interview_metrics"("p_interview_id" "uuid") TO "service_role";

-- サムネイル画像用ストレージ
INSERT INTO storage.buckets (id, name, public) VALUES ('interview-thumbnails', 'interview-thumbnails', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "interview_thumbnails_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'interview-thumbnails');
