import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * slug または id でインタビューを1件取得する（論理削除済みは除く）。
 * publishedOnly=true のときは公開済みのものだけを返す。
 */
export async function findInterviewByKey(
  key: string,
  { publishedOnly }: { publishedOnly: boolean }
) {
  const supabase = createAdminClient();
  let query = supabase
    .from("interviews")
    .select("*")
    .is("deleted_at", null)
    .eq(UUID_PATTERN.test(key) ? "id" : "slug", key);
  if (publishedOnly) {
    query = query.eq("publish_status", "published");
  }
  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch interview: ${error.message}`);
  }
  return data;
}

/**
 * 公開済みインタビューの一覧を取得（注目 → 表示順 → 新しい順）
 */
export async function findPublishedInterviews() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("publish_status", "published")
    .is("deleted_at", null)
    .order("is_featured", { ascending: false })
    .order("featured_order", { ascending: true })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Failed to fetch interviews: ${error.message}`);
  }
  return data;
}

/**
 * インタビューごとの公開された会話の件数
 */
export async function countPublicReportsByInterviewIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, number>();
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "count_public_reports_by_interview_ids",
    { p_interview_ids: ids }
  );
  if (error) {
    throw new Error(`Failed to count public reports: ${error.message}`);
  }
  return new Map(data.map((r) => [r.interview_id, Number(r.report_count)]));
}

/**
 * インタビューの回答者数・最後まで回答した数・公開件数
 */
export async function findInterviewMetrics(interviewId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_interview_metrics", {
    p_interview_id: interviewId,
  });
  if (error) {
    throw new Error(`Failed to fetch interview metrics: ${error.message}`);
  }
  return data[0] ?? null;
}

/**
 * interview_id からインタビュー質問一覧を取得（question_order昇順）
 */
export async function findInterviewQuestionsByInterviewId(interviewId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("interview_id", interviewId)
    .order("question_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch interview questions: ${error.message}`);
  }

  return data;
}

/**
 * プレビュートークンを取得
 */
export async function findPreviewToken(interviewId: string, token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("preview_tokens")
    .select("expires_at")
    .eq("interview_id", interviewId)
    .eq("token", token)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch preview token: ${error.message}`);
  }
  return data;
}
