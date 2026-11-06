import "server-only";

import { getChatSupabaseUser } from "@/features/chat/server/utils/supabase-server";
import { generateInitialQuestion } from "@/features/interview-session/server/services/generate-initial-question";
import type { LanguageModel } from "ai";
import type { InterviewMessage, InterviewSession } from "../../shared/types";
import {
  createInterviewSessionRecord,
  findActiveInterviewSession,
  findInterviewMessagesBySessionId,
} from "../repositories/interview-session-repository";
import type { GetUserFn } from "../utils/verify-session-ownership";

type InitializeInterviewChatDeps = {
  getUser?: GetUserFn;
  model?: LanguageModel;
  /**
   * 利用規約・プライバシーポリシーに同意済みか。
   * false のときは新しいセッションを作らず TermsConsentRequiredError を投げる（進行中のセッションの再開はできる）。
   */
  hasTermsConsent?: boolean;
};

/** 同意を得ないまま新しくインタビューを始めようとしたときのエラー */
export class TermsConsentRequiredError extends Error {
  constructor() {
    super("Terms consent is required to start a new interview session");
    this.name = "TermsConsentRequiredError";
  }
}

type InitializeInterviewChatResult = {
  session: InterviewSession;
  messages: InterviewMessage[];
};

/**
 * インタビューチャットの初期化処理
 * セッション取得/作成、メッセージ履歴取得、最初の質問生成を行う
 */
export async function initializeInterviewChat(
  billId: string,
  interviewConfigId: string,
  deps?: InitializeInterviewChatDeps
): Promise<InitializeInterviewChatResult> {
  // 認証
  const getUser = deps?.getUser ?? getChatSupabaseUser;
  const {
    data: { user },
    error: getUserError,
  } = await getUser();

  if (getUserError || !user) {
    throw new Error(
      `Failed to get user: ${getUserError?.message || "User not found"}`
    );
  }

  // セッション取得または作成
  let session = await findActiveInterviewSession(interviewConfigId, user.id);
  if (!session) {
    if (deps?.hasTermsConsent === false) {
      throw new TermsConsentRequiredError();
    }
    session = await createInterviewSessionRecord({
      interviewConfigId,
      userId: user.id,
    });
  }

  // メッセージ履歴を取得
  let messages = await findInterviewMessagesBySessionId(session.id);

  // メッセージ履歴が空の場合、最初の質問を生成
  if (messages.length === 0) {
    const initialQuestion = await generateInitialQuestion({
      sessionId: session.id,
      billId,
      interviewConfigId,
      userId: user.id,
      deps: { model: deps?.model },
    });

    if (initialQuestion) {
      messages = [initialQuestion];
    }
  }

  return {
    session,
    messages,
  };
}
