import "server-only";

import { findSessionsByUserId } from "../repositories/interview-session-repository";
import {
  getAuthenticatedUser,
  type LoaderDeps,
} from "../utils/verify-session-ownership";

export type InterviewHistoryItem = {
  sessionId: string;
  interviewName: string;
  interviewSlug: string;
  isInterviewOpen: boolean;
  startedAt: string;
  status: "completed" | "active" | "archived";
  reportId: string | null;
  isPublicByUser: boolean;
};

/**
 * ログイン中（匿名含む）のユーザーの回答履歴を取得する。
 * 未ログイン・取得失敗時は空配列。
 */
export async function getInterviewHistory(
  deps?: LoaderDeps
): Promise<InterviewHistoryItem[]> {
  const auth = await getAuthenticatedUser(deps);
  if (!auth.authenticated) return [];

  let rows: Awaited<ReturnType<typeof findSessionsByUserId>>;
  try {
    rows = await findSessionsByUserId(auth.userId);
  } catch (error) {
    console.error("Failed to fetch interview history:", error);
    return [];
  }

  return rows.flatMap((row) => {
    const interview = row.interviews;
    if (!interview || interview.deleted_at) return [];
    const report = Array.isArray(row.interview_report)
      ? row.interview_report[0]
      : row.interview_report;
    return [
      {
        sessionId: row.id,
        interviewName: interview.name,
        interviewSlug: interview.slug,
        isInterviewOpen: interview.status === "public",
        startedAt: row.started_at,
        status: row.completed_at
          ? "completed"
          : row.archived_at
            ? "archived"
            : "active",
        reportId: report?.id ?? null,
        isPublicByUser: report?.is_public_by_user ?? false,
      },
    ];
  });
}
