import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import { validatePreviewToken } from "@/features/interviews/server/loaders/get-interview";
import { getInterviewConfigAdmin } from "@/features/interviews/server/loaders/get-interview";
import { getInterviewQuestions } from "@/features/interviews/server/loaders/get-interview-questions";
import { InterviewChatClient } from "@/features/interview-session/client/components/interview-chat-client";
import { InterviewSessionErrorView } from "@/features/interview-session/client/components/interview-session-error-view";
import { initializeInterviewChat } from "@/features/interview-session/server/loaders/initialize-interview-chat";
import { env } from "@/lib/env";

interface InterviewPreviewChatPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
}

function PreviewBanner() {
  return (
    <div className="sticky top-0 z-50 bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              プレビューモード - このインタビューは一般公開されていません
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href={`${env.adminUrl}/interviews`}
              className="text-yellow-700 hover:text-yellow-900 underline"
            >
              管理画面に戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function InterviewPreviewChatPage({
  params,
  searchParams,
}: InterviewPreviewChatPageProps) {
  const [{ slug }, { token }] = await Promise.all([params, searchParams]);

  // 管理者用ローダー（下書き・募集終了も取得可能）
  const interviewConfig = await getInterviewConfigAdmin(slug);
  if (!interviewConfig) {
    notFound();
  }
  const billId = interviewConfig.id;

  // トークン検証
  const isValidToken = await validatePreviewToken(billId, token);
  if (!isValidToken) {
    notFound();
  }

  // ループモードの場合のみ質問数を取得（プログレスバー用）
  const questions =
    interviewConfig.mode === "loop"
      ? await getInterviewQuestions(interviewConfig.id)
      : [];

  // インタビューチャットの初期化処理
  try {
    const { session, messages } = await initializeInterviewChat(
      billId,
      interviewConfig.id
    );

    return (
      <>
        <PreviewBanner />
        <InterviewChatClient
          billId={billId}
          billTitle={interviewConfig.name}
          sessionId={session.id}
          initialMessages={messages}
          mode={interviewConfig.mode}
          totalQuestions={questions.length}
          estimatedDuration={interviewConfig.estimated_duration}
          sessionStartedAt={session.started_at}
          hasRated={session.rating != null}
          previewToken={token}
        />
      </>
    );
  } catch (error) {
    console.error("Failed to initialize interview session (preview):", error);
    return (
      <>
        <PreviewBanner />
        <InterviewSessionErrorView billId={billId} previewToken={token} />
      </>
    );
  }
}
