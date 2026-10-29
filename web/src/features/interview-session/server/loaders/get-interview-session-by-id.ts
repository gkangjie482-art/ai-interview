import "server-only";

import type { InterviewSession } from "../../shared/types";
import { findInterviewSessionWithConfigById } from "../repositories/interview-session-repository";
import {
  getAuthenticatedUser,
  isSessionOwner,
  type LoaderDeps,
} from "../utils/verify-session-ownership";

export type InterviewSessionWithBillId = InterviewSession & {
  /** インタビューID（interview_id と同じ値） */
  bill_id: string;
};

/**
 * セッションIDからインタビューセッション詳細を取得（完了済みセッション含む）
 * 認可チェック: セッションの所有者のみがセッション情報を取得できる
 */
export async function getInterviewSessionById(
  sessionId: string,
  deps?: LoaderDeps
): Promise<InterviewSessionWithBillId | null> {
  const authResult = await getAuthenticatedUser(deps);

  if (!authResult.authenticated) {
    console.error("Failed to get user:", authResult.error);
    return null;
  }

  const { userId } = authResult;

  let session: Awaited<ReturnType<typeof findInterviewSessionWithConfigById>>;
  try {
    session = await findInterviewSessionWithConfigById(sessionId);
  } catch (error) {
    console.error("Failed to fetch interview session:", error);
    return null;
  }

  // 認可チェック: セッションの所有者と現在のユーザーが一致するか
  if (!isSessionOwner(session.user_id, userId)) {
    console.error("Unauthorized access to interview session");
    return null;
  }

  // 呼び出し側の互換のため、インタビューIDを bill_id としても返す
  return {
    ...session,
    bill_id: session.interview_id,
  };
}
