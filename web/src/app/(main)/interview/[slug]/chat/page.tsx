import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { InterviewChatClient } from "@/features/interview-session/client/components/interview-chat-client";
import { InterviewSessionErrorView } from "@/features/interview-session/client/components/interview-session-error-view";
import {
  initializeInterviewChat,
  TermsConsentRequiredError,
} from "@/features/interview-session/server/loaders/initialize-interview-chat";
import { getInterviewConfig } from "@/features/interviews/server/loaders/get-interview";
import { getInterviewQuestions } from "@/features/interviews/server/loaders/get-interview-questions";
import {
  hasAgreedToCurrentTerms,
  TERMS_CONSENT_COOKIE,
} from "@/features/interviews/shared/terms-consent";
import { routes } from "@/lib/routes";

interface InterviewChatPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function InterviewChatPage({
  params,
}: InterviewChatPageProps) {
  const { slug } = await params;

  // 回答を受け付けているインタビューのみ（公開済み かつ 募集中）
  const interviewConfig = await getInterviewConfig(slug);

  if (!interviewConfig) {
    notFound();
  }
  const billId = interviewConfig.id;

  const questions = await getInterviewQuestions(interviewConfig.id);
  const multiSelectQuestionIds = questions
    .filter((q) => q.allow_multiple)
    .map((q) => q.id);

  // 利用規約・プライバシーポリシーに同意していなければ、新しく始めさせずに紹介ページ（同意画面）へ戻す
  const cookieStore = await cookies();
  const hasTermsConsent = hasAgreedToCurrentTerms(
    cookieStore.get(TERMS_CONSENT_COOKIE)?.value
  );

  // インタビューチャットの初期化処理
  let initialized: Awaited<ReturnType<typeof initializeInterviewChat>>;
  try {
    initialized = await initializeInterviewChat(billId, interviewConfig.id, {
      hasTermsConsent,
    });
  } catch (error) {
    if (error instanceof TermsConsentRequiredError) {
      redirect(routes.interviewLP(slug));
    }
    console.error("Failed to initialize interview session:", error);
    return <InterviewSessionErrorView billId={billId} />;
  }

  const { session, messages } = initialized;

  return (
    <InterviewChatClient
      billId={billId}
      billTitle={interviewConfig.name}
      sessionId={session.id}
      initialMessages={messages}
      mode={interviewConfig.mode}
      totalQuestions={interviewConfig.mode === "loop" ? questions.length : 0}
      multiSelectQuestionIds={multiSelectQuestionIds}
      estimatedDuration={interviewConfig.estimated_duration}
      sessionStartedAt={session.started_at}
      hasRated={session.rating != null}
    />
  );
}
