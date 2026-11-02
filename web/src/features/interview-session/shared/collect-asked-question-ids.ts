import { parseMessageContent } from "./message-utils";

/**
 * すでに聞いた質問IDを収集する（対象者条件などで飛ばした質問も消化済みに含める）
 */
export function collectAskedQuestionIds(
  messages: Array<{ role: string; content: string }>
): Set<string> {
  const askedQuestionIds = new Set<string>();
  for (const m of messages) {
    if (m.role === "assistant") {
      const { questionId, skippedQuestionIds } = parseMessageContent(m.content);
      if (questionId) {
        askedQuestionIds.add(questionId);
      }
      for (const id of skippedQuestionIds) {
        askedQuestionIds.add(id);
      }
    }
  }
  return askedQuestionIds;
}
