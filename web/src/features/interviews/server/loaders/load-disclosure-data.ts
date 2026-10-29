import "server-only";

import { buildInterviewSystemPrompt } from "@/features/interview-session/server/utils/build-interview-system-prompt";
import { buildSummarySystemPrompt } from "@/features/interview-session/shared/utils/build-summary-system-prompt";
import { type InterviewConfig, toPromptTopic } from "./get-interview";
import { getInterviewQuestions } from "./get-interview-questions";

export interface DisclosureData {
  billId: string;
  billName: string;
  interviewConfig: InterviewConfig;
  systemPrompt: string;
  summaryPrompt: string;
}

/**
 * 「AIへの指示（プロンプト）を見る」ページ用に、実際にAIへ渡すプロンプトを組み立てる
 */
export async function loadDisclosureData(
  interview: InterviewConfig
): Promise<DisclosureData> {
  const questions = await getInterviewQuestions(interview.id);
  const topic = toPromptTopic(interview);

  const systemPrompt = buildInterviewSystemPrompt({
    bill: topic,
    interviewConfig: interview,
    questions,
    currentStage: "chat",
    askedQuestionIds: new Set(),
    remainingMinutes: null,
  });

  const summaryPrompt = buildSummarySystemPrompt({
    bill: topic,
    interviewConfig: interview,
    messages: [],
  });

  return {
    billId: interview.id,
    billName: interview.name,
    interviewConfig: interview,
    systemPrompt,
    summaryPrompt,
  };
}
