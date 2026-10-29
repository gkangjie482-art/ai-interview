import "server-only";

import { createAdminClient } from "@mirai-gikai/supabase";
import type { InterviewInsert, InterviewUpdate } from "../../shared/types";

const UNIQUE_VIOLATION = "23505";

/** DB エラーを管理画面に出せる文言にする */
function toErrorMessage(
  error: { code: string; message: string },
  action: string
) {
  if (error.code === UNIQUE_VIOLATION && error.message.includes("slug")) {
    return "このURL（slug）はすでに使われています。別の値にしてください";
  }
  return `インタビューの${action}に失敗しました: ${error.message}`;
}

/** 論理削除されていないインタビューの一覧（新しい順） */
export async function findInterviews() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Failed to fetch interviews: ${error.message}`);
  }
  return data;
}

export async function findInterviewById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch interview: ${error.message}`);
  }
  return data;
}

export async function insertInterview(row: InterviewInsert) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("interviews")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    throw new Error(toErrorMessage(error, "作成"));
  }
  return data;
}

export async function updateInterviewById(id: string, row: InterviewUpdate) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("interviews").update(row).eq("id", id);
  if (error) {
    throw new Error(toErrorMessage(error, "更新"));
  }
}

/**
 * インタビューを論理削除する。公開ページから消えるよう下書きに戻し、
 * 公開中の会話も管理者側で非公開にする。
 */
export async function softDeleteInterviewById(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("interviews")
    .update({
      deleted_at: new Date().toISOString(),
      publish_status: "draft",
      status: "closed",
      is_featured: false,
    })
    .eq("id", id);
  if (error) {
    throw new Error(toErrorMessage(error, "削除"));
  }
  const { error: unpublishError } = await supabase.rpc(
    "unpublish_reports_by_interview_id",
    { p_interview_id: id }
  );
  if (unpublishError) {
    throw new Error(
      `公開中の会話の非公開化に失敗しました: ${unpublishError.message}`
    );
  }
}

/** インタビューごとの回答数 */
export async function countSessionsByInterviewIds(ids: string[]) {
  if (ids.length === 0) return new Map<string, number>();
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc(
    "count_sessions_by_interview_ids",
    { p_interview_ids: ids }
  );
  if (error) {
    throw new Error(`Failed to count sessions: ${error.message}`);
  }
  return new Map(data.map((r) => [r.interview_id, Number(r.session_count)]));
}

// ── プレビュートークン ─────────────────────────────

export async function findPreviewToken(interviewId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("preview_tokens")
    .select("token, expires_at")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch preview token: ${error.message}`);
  }
  return data;
}

export async function createPreviewToken(params: {
  interviewId: string;
  token: string;
  expiresAt: string;
  createdBy: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("preview_tokens").insert({
    interview_id: params.interviewId,
    token: params.token,
    expires_at: params.expiresAt,
    created_by: params.createdBy,
  });
  if (error) {
    throw new Error(`Failed to insert preview token: ${error.message}`);
  }
}

export async function deletePreviewTokensByInterviewId(interviewId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("preview_tokens")
    .delete()
    .eq("interview_id", interviewId);
  if (error) {
    throw new Error(`Failed to delete preview token: ${error.message}`);
  }
}
