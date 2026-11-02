import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getInterviewConfig } from "@/features/interviews/server/loaders/get-interview";
import { getInterviewQuestions } from "@/features/interviews/server/loaders/get-interview-questions";
import { InterviewChatClient } from "@/features/interview-session/client/components/interview-chat-client";
import { InterviewSessionErrorView } from "@/features/interview-session/client/components/interview-session-error-view";
import { initializeInterviewChat } from "@/features/interview-session/server/loaders/initialize-interview-chat";

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

  // インタビューチャットの初期化処理
  try {
    const { session, messages } = await initializeInterviewChat(
      billId,
      interviewConfig.id
    );

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
  } catch (error) {
    console.error("Failed to initialize interview session:", error);
    return <InterviewSessionErrorView billId={billId} />;
  }
}
